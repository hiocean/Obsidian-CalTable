/*
 * @Author: hiocean
 * @Date: 2023-04-05 20:55:03
 * @LastEditors: hiocean
 * @LastEditTime: 2023-04-08 09:48:00
 * @FilePath: \Obsidian-CalTable\settingTab.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by hiocean, All Rights Reserved. 
 */
import { App, Notice, PluginSettingTab, Setting, TextComponent } from 'obsidian';
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
		// new Setting(containerEl)
		// 	.setName('默认变量和值')
		// 	.setDesc('default dict')
		// 	.addTextArea(text => text
		// 		.setPlaceholder('Enter the dict')
		// 		.setValue(JSON.stringify(this.plugin.settings.variables))
		// 		.onChange(async (value) => {
		// 			console.log('suffix: ' + value);
		// 			this.plugin.settings.variables = JSON.parse(value);
		// 			await this.plugin.saveSettings();
		// 		}));

		this.addVars(this.containerEl.createEl("details", {
			// cls: "easytyping-nested-settings",
			attr: {
				...(this.plugin.settings.userAddVarsOpen ? { open: true } : {})
			}
		}))

	}


	addVars(containerEl: HTMLDetailsElement) {
		containerEl.empty();
		containerEl.ontoggle = async () => {
			this.plugin.settings.userAddVarsOpen = containerEl.open;
			await this.plugin.saveSettings();
		};
		const summary = containerEl.createEl("summary");
		summary.setText("自定义变量 (Customize Variables)")


		const varsSettingEI = new Setting(containerEl);
		varsSettingEI.setName("设置变量")
		const varKey = new TextComponent(varsSettingEI.controlEl);
		varKey.setPlaceholder("New key");
		const varValue = new TextComponent(varsSettingEI.controlEl);
		varValue.setPlaceholder("New value");

		varsSettingEI
			.addButton((button) => {
				button
					.setButtonText("+")
					.setTooltip("Add Vars")
					.onClick(async (buttonEl: any) => {
						let left = varKey.inputEl.value;
						let right = varValue.inputEl.value;
						if (left) {
							this.plugin.settings.variables[left] = right
							await this.plugin.saveSettings();
							this.display();
						}
						else { new Notice("missing Key"); }
					});
			});

		
		Object.keys(this.plugin.settings.variables).forEach(key => {
			let showStr = `${key}\t:\t${this.plugin.settings.variables[key]}`;
			new Setting(containerEl)
				.setName(showStr)
				.addExtraButton(button => {
					button.setIcon("trash")
						.setTooltip("Remove!")
						.onClick(async () => {
							delete this.plugin.settings.variables[key];
							await this.plugin.saveSettings();
							this.display();
						})
				});
		})
	}
}
