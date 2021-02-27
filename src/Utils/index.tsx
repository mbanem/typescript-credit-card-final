// import React from 'react'
import ReactTooltip from "react-tooltip"

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
export const outlineElementStyle = (element: HTMLLabelElement | HTMLDivElement): {width: string, height: string, transform: string} | null => {
	if (element)  {
		return {
			width: `${element.offsetWidth}px`,
			height: `${element.offsetHeight}px`,
			transform: `translateX(${element.offsetLeft}px) translateY(${element.offsetTop}px)`
		}
	}
	return null;
}