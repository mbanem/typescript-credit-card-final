import React from 'react'
import ReactTooltip from 'react-tooltip'
import { TCardNum, ICardState, ICaretState, initialCardState } from 'src/Interfaces'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { hideTooltip} from "./Card"
const CARDS = {
	visa: '^4',
	amex: '^(34|37)',
	mastercard: '^5[1-5]',
	discover: '^6011',
	unionpay: '^62',
	troy: '^9792',
	diners: '^(30[0-5]|36)'
}
/**
* returns card type Visa, American Express ... 
* based on leading card number digits
*/
export const cardType = (cardNumber: string): string => {
	let re;
	for (const [card, pattern] of Object.entries(CARDS)) {
		re = new RegExp(pattern);
		if (cardNumber.match(re) != null) {
			return card;
		}
	}
	return 'no-name'; // default type
}
/**
	 * maskCardNumber
	 * depending on mask param Card Number is visible or partially hidden
	 * @param cardMaskState 
	 * @param mask 
	 */
export const maskCardNumber = (cn: string, mask = true): string[] => {
	const pattern = mask ? '$1 **** **** $4' : '$1 $2 $3 $4';
	cn = (cn + '####********####'.slice(cn.length)).slice(0, 19);
	return (cn.replace(/(.{4,4})(.{4,4})(.{4,4})(.{4,4}).*/, pattern)).split('');
}
export interface ICardNumber{
	cn: {
    state: ICardState;
    caretState: ICaretState;
		cardNumberRef: React.RefObject<HTMLLabelElement>;
		onCardElementClick: (event: React.MouseEvent<HTMLElement, MouseEvent> | null, key: string) => void;
		cardMaskState: TCardNum;
		setCardMaskState: React.Dispatch<React.SetStateAction<TCardNum>>;
	}
}

// =========================================
// -------- CardNumber Component -----------
// =========================================

export const CardNumber: React.FC<ICardNumber> = (
	{ cn: {
		state,
		caretState,
		cardNumberRef,
		onCardElementClick,
		cardMaskState,
		setCardMaskState } }: ICardNumber) => {

	/**
	 * mouseEnterCN
	 * tooltip should be visible only before an element gets focus in order
	 * for users to see how to handle UI element then do not show it at all
	 * if state item is not in initial state suppress tooltip
	 */
	const mouseEnterCN = () => {
		const cnc = cardNumberRef.current;
		if (!cnc) {
			return
		}
		// show tooltip only if none of the elements is in focus
		if (state.cardNumber === initialCardState.cardNumber && !state.selectedLabel) {
			ReactTooltip.show(cnc)
			hideTooltip(cnc, 2000)
		// if some element is in focus suppress tooltip as it was already shown earlier
		} else {
			ReactTooltip.hide(cnc)
			setCardMaskState(maskCardNumber(state.cardNumber, false));
			if (state.cardNumber !== initialCardState.cardNumber && cardNumberRef.current) {
				cardNumberRef.current.classList.add('yellow');
			}
		}
	}

	// const maskPosToInputBoxPos = (maskIx: number) => {
	// 	const nSpaces = '#### **** **** ####'.slice(0, maskIx+1).replace(/\S/g,'').length
	// 	return maskIx - nSpaces
	// }
	/**
	 * mouseLeaveCN
	 * restore Card Number is masked state
	 */
	const mouseLeaveCN = () => {
		setCardMaskState(maskCardNumber(state.cardNumber));
		if (state.cardNumber !== initialCardState.cardNumber && cardNumberRef.current) {
			cardNumberRef.current.classList.remove('yellow');
		}
	}

	const p = caretState.cardNumber.pos
	const maskPos = caretState.cardNumber.delta === -1
		? [-1,0,1, 2, 3, 5, 6, 7, 8, 10, 11, 12,13, 15, 16, 17, 18, 19,19,19][p != null ? p : 0]
		: caretState.cardNumber.delta === 1
			? [-1, 0,1,2,3,  5,6,7,8, 10,11,12,13, 15,16,17,18, 18][p != null ? p : 0]
			: Math.min((p + Math.floor(p / 4 -1)), 18)
  
	const equal = (ix: number) => {
		return ix===maskPos
	}
	
	return (
		<>
			<div className="card-item__top">
				<img
					src={'/chip.png'}
					alt=""
					className="card-item__chip"
				/>
				<div className="card-item__type">
					<img
						alt={cardType(state.cardNumber)}
						src={`/card-type/${cardType(state.cardNumber)}.png`}
						className="card-item__typeImg"
					/>
				</div>
			</div>
			<label
				className="card-item__number"
				ref={cardNumberRef}
				onClick={(evt) => onCardElementClick(evt, 'cardNumber')}
				onMouseEnter={mouseEnterCN}
				onMouseLeave={mouseLeaveCN}
				data-tip='Click to enter Card Number'
				data-place='top'
				data-effect='solid'
				data-offset="{'top': -20, 'left': 10}"
			>
				<TransitionGroup
					className="slide-fade-up"
					component="div"
				>
					{cardMaskState.map((val, maskIx) => (
						<CSSTransition
							classNames="slide-fade-up"
							timeout={250}
							key={maskIx}
						>
							<div className={`card-item__numberItem ${state.selectedLabel === 'cardNumber' && equal(maskIx) ? 'yn-bold':null}`}>
								{
									[4, 9, 14].includes(maskPos) && equal(maskIx)
										? <span className='underscore'>_</span>
										: val
								}
							</div>
						</CSSTransition>
					))
					}
				</TransitionGroup>
			</label>

		</>
	)
}