import React from 'react'

/**
 * YearWidget
 * render nine consecutive years as div elements inside a div wrapper
 */
export interface IYearWidgetProps{
	yw: {
		setStateDate: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, dateKey: string, refWidgetKey: string) => void;
	}
}
export const YearWidget: React.FC<IYearWidgetProps> = ({yw:{setStateDate}}:IYearWidgetProps) => {
// export const YearWidget: React.FC = () => {
	const year = new Date().getFullYear()%100

	return (
		<>
			{Array(9).fill(0).map((_,ix) => (
				<div key={year + ix}
					onClick={(evt) => setStateDate(evt, 'cardYear','yearWidget')}
				>{year + ix}</div>
			))}
		</>
	)
}
