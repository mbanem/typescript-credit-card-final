export interface ICardState {
	selectedLabel: string
	cardHolder: string
	cardNumber: string
	cardMonth: string
	cardYear: string
  cardCvc: string
	isCardFlipped: boolean
	currentElementRef: React.RefObject<HTMLLabelElement|HTMLDivElement>|null
  previousElementRef: React.RefObject<HTMLLabelElement|HTMLDivElement>|null
	userName: string
}

export const initialCardState: ICardState = {
	selectedLabel: '',
	cardHolder: 'FULL NAME',
	cardNumber: '####********####',
	cardMonth: 'MM',
	cardYear: 'YY',
	cardCvc: '***',
	isCardFlipped: false,
	currentElementRef: null,
	previousElementRef: null,
	userName: 'Mili Milutinovic'
}
export interface ICaretState{
  cardNumber: {pos:number, delta:number}
  cardHolder: {pos:number, delta:number}
  cardCvc: { pos: number, delta: number }
  cardMonth: { pos: number, delta: number } // not in use
  cardYear: { pos: number, delta: number }  // not in use
}
export const initialCaretState = {
	cardNumber: { pos: 0, delta: 0 },
	cardHolder: { pos: 0, delta: 0 },
	cardCvc: { pos: 0, delta: 0 },
	cardMonth: { pos: 0, delta: 0 },
	cardYear: { pos: 0, delta: 0 },
}
// ICardNum holds an array of CardNumber chars for rendering in a label
// while the state holds jes CardNumber as a string
export type TCardNum = string[];
export const initialCardNum = {
	cardNumber: '',
}
export interface IAppState {
	cardNumber: string
	cardHolder: string
	cardMonth: string
	cardYear: string
	cardCvc: string
}
export const initialAppState = {
	cardNumber: '',
	cardHolder: '',
	cardMonth: '',
	cardYear: '',
	cardCvc: '',
}

export interface IStyle {
	width: string
	height: string
  transform: string
}
export const initialStyle = {
	width: '100%',
	height: '100%',
	transform: '',
}
