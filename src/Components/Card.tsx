import React, { useState, useEffect, useRef } from 'react'

import ReactTooltip from 'react-tooltip'
import { IAppState, ICardState, initialCardState, IStyle, initialStyle, TCardNum, ICaretState, initialCaretState } from '../Interfaces'
import { MonthWidget } from './MonthWidget'
import { YearWidget } from './YearWidget'
import { CardNumber, cardType, maskCardNumber } from './CardNumber'
import { CardHolder } from './CardHolder'
import { CardBackground } from './CardBackground'
import { CardExpiration } from './CardExpiration'
import { CardBackside } from './CardBackside'
import { setTimeout } from 'timers'
import '../Styles/styles.scss'

type TValidate = (str: string) => [boolean, string]
type DRef = HTMLDivElement | null
type IRef = HTMLInputElement | null

export interface ICardProps {
  setAppState: (state: IAppState) => void,
}

export const BACKGROUND_IMG = '/card-background/0.jpeg'

// cannot persuade typescript that a function could return string | string[] based on flag
export const formatCardNumber = (cn: string, mask = true): string[] => {
	const pattern = mask ? '$1 **** **** $4' : '$1 $2 $3 $4'
	cn = (cn + '####********####'.slice(cn.length)).slice(0, 19)
	return (cn.replace(/(.{4,4})(.{4,4})(.{4,4})(.{4,4}).*/, pattern)).split('')
}
/**
 * Allows single spaces and dashed with no spaces around
 * @param value string to capitalize
 */
export const capitalize = (value: string): string => {
	return value.replace(/\s{2,}/g,' ').replace(/\s*-\s*/g,'-').replace(/^[a-z]|[ -][a-z]/g, (c) => c.toUpperCase())
}
/**
	 * allow specific tooltip for given interval necessary to easily read the tip
	 * @param ref 
	 * @param interval 
	 */
export const hideTooltip = (ref: HTMLDivElement | HTMLLabelElement | null, interval: number):void => {
	setTimeout(() => {
		ref && ReactTooltip.hide(ref)
	}, interval)
}
/**
	 * set css class for rounded border box around a given element
	 * @param element 
	 */
const outlineElementStyle = (element: HTMLLabelElement | HTMLDivElement) => {
	if (element)  {
		return {
			width: `${element.offsetWidth}px`,
			height: `${element.offsetHeight}px`,
			transform: `translateX(${element.offsetLeft}px) translateY(${element.offsetTop}px)`
		}
	}
	return null;
}
// ===========================================
// ------------  THE CARD APP ----------------
// ===========================================

export const Card: React.FC<ICardProps> = ({setAppState}: ICardProps) => {
	const [style, setStyle] = useState<IStyle>(initialStyle)
	const [state, setState] = useState<ICardState>(initialCardState)
	const [cardMaskState, setCardMaskState] = useState<TCardNum>(maskCardNumber(state.cardNumber))
	const [caretState, setCaretState] = useState<ICaretState>(initialCaretState)
	const cardNumberRef = useRef<HTMLLabelElement>(null)
	const cardHolderRef = useRef<HTMLLabelElement>(null)
	const cardCvcRef = useRef<HTMLDivElement>(null)

	const cardMonthRef = useRef<HTMLDivElement>(null)
	const cardYearRef = useRef<HTMLDivElement>(null)
	// const cvcNumberRef = useRef<HTMLDivElement>(null)
	const monthWidgetRef = useRef<HTMLDivElement>(null)
	const yearWidgetRef = useRef<HTMLDivElement>(null)
	const errorMsgRef = useRef<HTMLDivElement>(null)
	const doneRef = useRef<HTMLDivElement>(null)
	const flipRef = useRef<HTMLDivElement>(null)

	const inputBoxRef = useRef<HTMLInputElement>(null)
	/**
	 * state items are based on keys and supporting UI references
	 * are key+Ref so from the key we get reference to its UI elements
	 */
	const refFromKey = {
		cardNumber: cardNumberRef,
		cardHolder: cardHolderRef,
		cardMonth: cardMonthRef,
		cardYear: cardYearRef,
		cardCvc: cardCvcRef,
		monthWidget: monthWidgetRef,
		yearWidget: yearWidgetRef,
	}
  
	/**
	 * sets css for rounded bordered box when style state is set to
	 * and makes visible flip and done buttons when appropriate entries are make
	 */
	useEffect(() => {
		if ( state.currentElementRef && state.currentElementRef.current) {
			const style = outlineElementStyle(state.currentElementRef.current);
			if (style) {
				setStyle(style);
			}
			setDoneButtonVisibility();
		}
	}, [state])
	/**
	 * updateAppState - after user completes CreditCard sends data to main app
	 */
	const updateAppState = () => {
		const apps = {
			cardNumber: state.cardNumber.replace(/(\d4,4})/g, '$1 ').trimRight(),
			cardHolder: capitalize(state.cardHolder),
			cardMonth: state.cardMonth,
			cardYear: state.cardYear,
			cardCvc: state.cardCvc,
		}
		setAppState(apps)
		doneRef.current?.classList.add('hide')
		flipRef.current?.classList.add('hide')
		if (state.isCardFlipped) {
			flipCard(false)
		}
		setState({ ...state, ...initialCardState })
		setCardMaskState(maskCardNumber(''))
	}
  
	const maxEntryLength = { cardNumber: 16, cardHolder: 25, cardMonth: 2, cardYear: 2, cardCvc: 3 }
	const isValid = {
		cardNumber: (str: string) => {
			return /\D+/.test(str)
				? [false, 'Only digits are allowed']
				: state.cardNumber.length === 16
					? [true, 'Full CardNumber']
					: [true, 'Partial CardNumber']
		},
		cardHolder: (char: string) => {
			if (state.cardHolder === initialCardState.cardHolder) {
				setState({...state, cardHolder:''})
			}
			return /^[A-Za-z- ]*$/.test(char) ? [true, ''] : [false, 'Only letters, spaces amd dashes']
		},
		// amex uses 4-digit cvc and others 3-digit cvc
		cardCvc: (char: string) => {
			const ref = inputBoxRef.current
			const inputLnt = ref ? ref.value.length : 0
			const type = cardType(state.cardNumber)
			const lnt = type === 'amex' ? 4 : 3
			// if valid set true/false as error in case cvc is of full length 3 or 4
			return (/^[0-9]+$/.test(char) && (inputLnt <= lnt)) ? [true, inputLnt === lnt] : [false, `Up to ${lnt + 1} digits allowed'`]
		}
	}
	const nameValidator: TValidate = (value: string): [boolean, string] => {
		// todo dash should be surrounded by at least with two chars
		// dash must be between at least two chars
		// if (
		// 	value
		// 		.split('-')
		// 		.reduce((min, c) => (c.length < min ? c.length : min), 100) < 2
		// ) {
		// 	return [false,'Min 2 chars around a dash']
		// }
		if (value.match(/[^A-Za-z- ]/)) {
			return [false, 'Only letters spaces and dashes']
		}
		return [true, '']
	}
	const isCardFilledOut = () => {
		const [valid, error] = isValid['cardCvc'](state.cardCvc)
		if (valid  && error &&
      isValid['cardNumber'](state.cardNumber)[0] &&
      isValid['cardHolder'](state.cardHolder)[0] &&
      state.cardMonth && state.cardYear &&
      doneRef.current)
		{
			doneRef.current.classList.remove('hide')
			console.log('isCardFilledOut done visible', )
		}
	}
	/**
	 * setError - ignores keystroke do to error
	 * @param key - state key for entry
	 * @param msg 
	 * @param err 
	 * @param inp - input box reference.current
	 */
	const setError = (key: string, msg: string, err: DRef = errorMsgRef.current, inp: IRef = inputBoxRef.current) => {
		if (!err || !inp) return
		err.innerText = msg
		err.classList.remove('hide')
		inp.value = state[key]
		onCardElementClick(null, key)
	}
	/**
	 * when Card Number, Holder, MOnth and Year are entered,
	 * flip button gets available to allow setting cvc
	 */
	const setFlipButtonVisibility = (): boolean => {
		const fb = flipRef.current
		const tf = /^\d+$/.test(state.cardNumber) && state.cardNumber.length === 16
			&& state.cardHolder.length > 5
			&& state.cardHolder !== 'FULL NAME'
			&& /^\d{2,2}$/.test(state.cardMonth)
			&& /^\d{2,2}$/.test(state.cardYear)
    
		if (fb) {
			if (tf) {
				setTimeout(() => {
					flipRef.current && flipRef.current.classList.remove('hide')
					console.log('setFlipButtonVisibility flip visible', )
				}, 100)
				// flipCard(false)
			} else {
				fb.classList.add('hide')
				console.log('setFlipButtonVisibility flip hidden', )
			}
		}
		return tf
	}
	/**
	 * when card number, holder name, month, year and cvc are entered
	 * the done button become available to send card data to the main app
	 */
	const setDoneButtonVisibility = () => {
		const db = doneRef.current
		const tf = setFlipButtonVisibility()
			&& /^\d{3,4}$/.test(state.cardCvc)
		if (db) {
			if (tf) {
				db.classList.remove('hide')
				console.log('setDoneButtonVisibility done visible', )
			} else {
				console.log('setDoneButtonVisibility timeout done to hide', )
				setTimeout(() => { db.classList.add('hide') }, 100)
			}
		}    
	}
	
	/**
	 * input box React onChange handler
	 * controls allowed chars and renders error if any
	 * @param event.target.value 
	 */
	const handleInputOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {	
		event.preventDefault()
		event.stopPropagation()
		const { target: { value } } = event
		const key = state.selectedLabel
		const err = errorMsgRef.current
		const pos = inputBoxRef.current ? inputBoxRef.current?.selectionStart : 0
		setCaretState({ ...caretState, [key]: { pos, delta: 0 } })
    
		// ignore keystrokes if out of max length by setting old value in input box
		if (value.length > maxEntryLength[key] && inputBoxRef.current) {
			inputBoxRef.current.value = state[key]
			return
		}
		// regex validation for different entries (name,number,cvc)
		const [valid, error] = isValid[key](value)
		// if cardNumber is not complete isValid returns [true,''] but no error
		if (!valid && err) {
			if (error) {
				setError(key, error)
			}
			return
		}
		// name validator for dashes
		if (key === 'cardHolder') {
			const [valid, error] = nameValidator(state.cardHolder + value)
			if (!valid && err) {
				setError(key, error)
				return
			}
		}
		setState({ ...state, [key]: value})
		if (key === 'cardNumber') {
			setCardMaskState(maskCardNumber(value))
		}
		if (err && !err.classList.contains('hide')) {
			err.classList.add('hide')
		}
		isCardFilledOut()
	}
	/**
	* highlightCaretPosition based on input caret positions
	* highlights char in label adding caret as border-right vertical line
	* @param event 
	*/
	// const highlightCaretPosition = () => {
	const DELTA = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 0, ArrowDown: 0, PageDown: 1, PageUp: 0, End: 1, Home: 0 }
	const highlightCaretPosition = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault()
		event.stopPropagation()
		let pos = inputBoxRef.current?.selectionStart
		if (pos === null || pos === undefined) {
			pos = 0
		}

		setCaretState({
			...caretState, [state.selectedLabel]: { pos: pos, delta:  DELTA[event.code] || 0}
		})
	}

	/**
	 * clicked Month/Year is saved in state and hide the widget
	 * @param event 	- holds reference to clicked number
	 * @param dateKey 	- ke for state entry
	 * @param refWidgetKey - ref of rendered block to hide
	 */
	const setStateDate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, dateKey: string, refWidgetKey: string) => {
		const d = event.target as HTMLDivElement;
		const value = `0${d.innerText}`.slice(-2); // leading zero if single digit
		
		if (d.innerText.length <= 2) {
			setState({ ...state, [dateKey]: value });
			refFromKey[refWidgetKey].current.classList.toggle('hide');
		}
	}

	/**
	 * every UI element on click gets rounded box as visual focus indicator
	 * and input box gets focus and its content cleared or set previous content
	 * @param event 
	 * @param key 
	 */
	const onCardElementClick = (event: React.MouseEvent<HTMLElement, MouseEvent> | null, key: string) => {
		// could be called out of existing event, so if event is present we stop bubbling
		// as clicking on YY will propagate to MM and MM will be left asa event context
		if (event) {
			event.stopPropagation();
		}
		ReactTooltip.hide(refFromKey[key].current)
		const input = inputBoxRef.current
		if (!input) return
		input.selectionStart = caretState[key].pos
		setState({
			...state,
			selectedLabel: key,
			previousElementRef: state.currentElementRef,
			currentElementRef: refFromKey[key === 'cardYear' ? 'cardMonth' : key],
		})
		// if Month or Year is selected show select Block instead of input inputBox
		if ('cardMonth|cardYear'.includes(key)) {
			const blockKey = key[4].toLowerCase() + key.slice(5) + 'Widget';
			// close month/year if already open when the opposite is selected
			const oppositeBlock = { monthWidget: yearWidgetRef, yearWidget: monthWidgetRef };
			const opp = oppositeBlock[blockKey].current;

			if (opp && !opp.classList.contains('hide')) {
				opp.classList.toggle('hide');
			}
			const ref = refFromKey[blockKey].current
			if (ref) {
				ref.classList.toggle('hide');
			}
		} else if (key === 'cardNumber') {
			if (event?.ctrlKey) {
				errorMsgRef.current?.classList.add('hide')
			}
			let cNum = event?.ctrlKey
				? '4212345678901234'
				: state.cardNumber === initialCardState.cardNumber
					? ''
					: state.cardNumber
			if (cNum[0] === '0') {
				cNum = '4'+ cNum.slice(1)
			}
			setState({
				...state,
				cardNumber: cNum,
				selectedLabel: 'cardNumber',
				currentElementRef: cardNumberRef
			})
			setCardMaskState( maskCardNumber(cNum))
			setTimeout(() => {
				input.value = cNum
				input.selectionStart = input.value.length+1
			}, 100)
		}		
		else if (key === 'cardHolder' && event && event.ctrlKey) {
			setState({
				...state,
				cardHolder: state.userName,
				selectedLabel: 'cardHolder',
				currentElementRef: cardHolderRef
			})
			setTimeout(() => {
				input.value = state.userName+' '
				input.selectionStart = input.value.length+1
				input.selectionStart = caretState[key].pos
			}, 100)
		}
		input.value = state[key] === initialCardState[key] ? '' : state[key];
		input.focus();
	}


	/**
	 * shown only when front part elements are filled to reveal the card back side
	 */
	const flipCard = (checkDoneButton:boolean) => {
		const fc = !state.isCardFlipped;
		const input = inputBoxRef.current;
		if (fc && state.cardNumber.length === 16) {
			onCardElementClick(null, 'cardCvc');
			setState({
				...state,
				isCardFlipped: fc,
				selectedLabel: 'cardCvc',
				currentElementRef: cardCvcRef,
			});
			if (input) {
				input.value = state.cardCvc === initialCardState.cardCvc ? '' : state.cardCvc;
			}
		} else {
			setState({
				...state,
				isCardFlipped: fc,
				currentElementRef: null
			});
			if (input) {
				input.value = '';
			}
		}
		if (checkDoneButton) {
			setDoneButtonVisibility()
		}
	}

	/**
	 * this is not resource hog function but is used as an example
	 */
	// const useCardType = useMemo(() => {
	// 	return cardType();
	// }, [state.cardNumber])

	return (
		<>
			<div className={'card-item ' + (state.isCardFlipped ? '-active' : '')}>
				<div className="card-item__side -front">
					<CardBackground cb={{ state, style}}/>
					<div className="card-item__wrapper">
						<CardNumber cn={{state, caretState, cardNumberRef, onCardElementClick, cardMaskState, setCardMaskState	}} />
						<div className="card-item__content">
							<CardHolder ch={{state, caretState, cardHolderRef, onCardElementClick }}/>
							<CardExpiration ce={{state,cardMonthRef,cardYearRef,onCardElementClick}}/>
						</div>
					</div>
					<div className="card-input">
						<input
							type="text"
							className='input-box'
							maxLength={40}
							placeholder="INPUT BOX"
							autoComplete="off"
							name="inputBox"
							onChange={handleInputOnChange}
							ref={inputBoxRef}
							onKeyUp={highlightCaretPosition}
						/>
					</div>
					{/* <div ref={doneRef} className='done-button hide' onClick={updateAppState}>done</div>
					<div ref={flipRef} className='flipper-button hide' onClick={()=>flipCard(true)}>flip card</div> */}
				</div>

				<CardBackside bs={{ state, cardCvcRef }}/>
				<div ref={errorMsgRef} className="error-msg hide"></div>
				
				<div className="month-block hide"
					ref={monthWidgetRef}
					// onClick={(evt) => setStateDate(evt, 'cardMonth','monthWidget')}
				>
					<MonthWidget mw={{setStateDate}}/>
				</div>
				<div className="year-block hide"
					ref={yearWidgetRef}
				>
					<YearWidget yw={{setStateDate}}/>
				</div>
				<ReactTooltip className='tooltip-expire'
					multiline={true}
					event="mouseEnter"
					delayHide={600}/>
				<div ref={doneRef} className='done-button hide' onClick={updateAppState}>done</div>
				<div ref={flipRef} className='flipper-button hide' onClick={()=>flipCard(true)}>flip card</div>
			</div>
			{/* <div className="card-input">
				<input
					type="text"
					className='input-box'
					maxLength={40}
					placeholder="INPUT BOX"
					autoComplete="off"
					name="inputBox"
					onChange={handleInputOnChange}
					ref={inputBoxRef}
					onKeyUp={highlightCaretPosition}
				/>
			</div> */}
		</>
	)
}

