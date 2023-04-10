import { MarkdownView, Notice, Plugin } from 'obsidian';
import { CalTableSettingTab } from './settingTab';
import { CalTablePluginSettings, DEFAULT_SETTINGS } from './settings';


export default class CalTable extends Plugin {
	settings: CalTablePluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(this.settings.codeKey, (source, el, ctx) => {
			const lines = source.split("\n").filter(line => line.trim() !== "" && !/^[\/#;]/.test(line));  // 去除空行或者以*、/、#等字符开头的元素
			const dots = ".".repeat(this.settings.repeat)
			const unit: string = this.getVariables()?.currency || this.settings.suffix
			this.generateTable(el, lines, dots, unit);
			this.addCopyButton(el);
		});

		// this.app.metadataCache.on("changed", async (file) => {
		// 	if (this.app.workspace.getActiveFile()?.path === file.path) {
		// 		new Notice("changed")
		// 		await this.update(".", ".");				
		// 		new Notice("changed2")
		// 	}
		// });
		this.addSettingTab(new CalTableSettingTab(this.app, this));

	}

	private generateTable(el: HTMLElement, lines: string[], dots: string, unit: string) {
		let accumulatedValues: number[][] = []; //保留各行的结果以备求和

		const table = el.createEl("table"); //创建表格
		const body = table.createEl("tbody");

		lines.forEach((inputText) => {
			const calulatedValue = this.evalRow({ textOfLine: inputText, accumulatedValues: accumulatedValues });
			const rowEL = body.createEl("tr"); //创建行
			const c1 = rowEL.createEl("td");
			const c1Input = c1.createEl("div", {
				text: inputText + dots,
				attr: { contentEditable: true }
			});
			c1Input.addEventListener("keydown", event => {
				if (event.key === "Enter") { // 判断是否按下回车键
					event.preventDefault(); // 阻止默认操作
					const outputText = c1Input.innerText.replace(dots, '').trim(); // 获取文本内容，并去除前后空格
					this.update(inputText, outputText);
				}
			});

			const c2 = rowEL.createEl("td", { text: calulatedValue.toFixed(0), attr: { style: "text-align: right; vertical-align: bottom;" } });
			const c3 = rowEL.createEl("td", { text: unit, attr: { style: "text-align: right; vertical-align: bottom;" } });
			if (inputText.match(new RegExp(this.settings.specialCellKeyword, "gi"))) {
				c1.style.cssText += ";" + this.settings.specialCellCss + ";";
				c2.style.cssText += ";" + this.settings.specialCellCss + ";";
				c3.style.cssText += ";" + this.settings.specialCellCss + ";";
			}
		});
	}

	private addCopyButton(el: HTMLElement) {
		const button = el.createEl("button", { text: "Copy Table" });
		button.addEventListener("click", () => {
			const table = el.querySelector("table");
			const range = document.createRange();
			range.selectNode(table);
			window.getSelection()?.removeAllRanges();
			window.getSelection()?.addRange(range);
			document.execCommand("copy");
			window.getSelection()?.removeAllRanges();
			button.innerText = "Table Copied!";
		});
	}

	private async update(findText: string, replaceText: string) {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView instanceof MarkdownView) {			// 使用 editor transaction 更新，性能更好
			const editor = markdownView.editor;
			const cursor = editor.getCursor();
			const result = editor.getValue().replace(findText, replaceText)
			editor.setValue(result);
			await markdownView.save();
			editor.setCursor(cursor);
		}
	}

	private evalRow({ textOfLine, accumulatedValues = [] }: { textOfLine: string; accumulatedValues?: number[][]; }) {
		const regex = /\(([^()]*)\)[^(]*$/; //找到最后一个（）
		const match = textOfLine.match(regex);
		const length = accumulatedValues.length;
		if (match) {
			const valueForCurrRow = this.evalStringWithVars(match[1], this.getVariables())
			const sum = length >= 1 ? accumulatedValues[length - 1][1] + valueForCurrRow : valueForCurrRow
			accumulatedValues.push([valueForCurrRow, sum]);
			return valueForCurrRow;
		}
		else if (textOfLine.match(/subtotal/i)) {
			const sum = accumulatedValues[length - 1][1] || 0;
			accumulatedValues.push([0, 0]);
			return sum
		}
		else if (textOfLine.match(/total/i)) {
			const sum = accumulatedValues.map(e => e[0]).reduce((pre, cur) => pre + cur, 0);
			return sum
		}
		else { return 0; }
	}

	private evalStringWithVars(s: string, variables: { [x: string]: string; }) {
		let input = s;
		Object.keys(variables).forEach((key) => {
			input = input.replace(key, variables[key] + this.settings.defaultOperator);
		});
		input = input.replace(/[;]/g, "+").split(" ") 		// 将字符串按空格拆分成数组元素
			.filter(e => /[0-9+\-*/]/.test(e)) 				//仅保留有数字和运算符的
			.map(e => e.replace(/[^0-9\.+\-*/%]/g, "")) 			//去除字母
			.join("").split(/([+\-*/])/) 					// 合并后再用运算符拆分
			.filter((e, i, a) => !/[+\-*/]/.test(e) || /[0-9]/.test(a[i + 1])) //去除重复运算符
			.join("").replace(/%/g, "* 0.01"); //合并并替换%符号，这样就不用mathjs了
		// console.log(arr);
		return eval(input);
	}

	private getVariables() {
		let variables = { ...this.settings.variables }; //使用扩展运算符
		const tf = this.app.workspace.getActiveFile();
		if (tf) { variables = { ...variables, ...this.app.metadataCache.getFileCache(tf)?.frontmatter }; }
		return variables;
	}



	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}