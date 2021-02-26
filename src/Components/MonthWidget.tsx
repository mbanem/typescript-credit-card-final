import React from 'react'

/**
 * MonthWidget
 * renders months 01..12 as div elements inside a div wrapper
 */
export interface IMonthWidgetProps{
	mw: {
		setStateDate: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, dateKey: string, refWidgetKey: string) => void;
	}
}
export const MonthWidget: React.FC<IMonthWidgetProps> = ({mw:{setStateDate}}:IMonthWidgetProps) => {

	return (
		<>
			{Array(12).fill(0).map((_,ix) => (
				<div key={ix + 10}
					onClick={(evt) => setStateDate(evt, 'cardMonth','monthWidget')}
				>{ix + 1}</div>
			))}
		</>
	)
}