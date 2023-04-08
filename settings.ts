/*
 * @Author: hiocean
 * @Date: 2023-03-30 23:49:14
 * @LastEditors: hiocean
 * @LastEditTime: 2023-04-08 22:51:54
 * @FilePath: \Obsidian-CalTable\settings.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by hiocean, All Rights Reserved. 
 */
export interface CalTablePluginSettings {
	specialCellKeyword: string | RegExp;
	specialCellCss: string;
	userAddVarsOpen: boolean;
	variables: {[key: string]: any};
	suffix: string;
	codeKey: string;
	defaultOperator: string
	repeat: number;
}
export const DEFAULT_SETTINGS: CalTablePluginSettings = {
	variables: { "XX": 10000 },
	suffix: "USD",
	codeKey: 'cal',
	defaultOperator: "*",
	repeat: 10,
	userAddVarsOpen: true,
	specialCellCss: "border-bottom:1px solid #f00",
	specialCellKeyword: "total"
};
