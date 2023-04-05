/*
 * @Author: hiocean
 * @Date: 2023-04-05 20:55:03
 * @LastEditors: hiocean
 * @LastEditTime: 2023-04-05 21:15:09
 * @FilePath: \Obsidian-CalTable\CalTableSettingTab.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by hiocean, All Rights Reserved. 
 */
import { App, PluginSettingTab, Setting } from 'obsidian';
import CalTable from './main';

export class CalTableSettingTab extends PluginSettingTab {
	plugin: CalTable;
	constructor(app: App, plugin: CalTable) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('默认后缀名')
			.setDesc('default suffix')
			.addText(text => text
				.setPlaceholder('Enter the suffix')
				.setValue(this.plugin.settings.suffix)
				.onChange(async (value) => {
					console.log('suffix: ' + value);
					this.plugin.settings.suffix = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('默认变量和值')
			.setDesc('default dict')
			.addTextArea(text => text
				.setPlaceholder('Enter the dict')
				.setValue(JSON.stringify(this.plugin.settings.variables))
				.onChange(async (value) => {
					console.log('suffix: ' + value);
					this.plugin.settings.variables =JSON.parse(value);
					await this.plugin.saveSettings();
				}));
	}
}
