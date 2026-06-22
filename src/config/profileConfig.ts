import type { ProfileConfig } from "../types/profileConfig";

export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	avatar: "assets/images/avatar.jpg",

	// 名字
	name: "花海",

	// 个人签名
	bio: "及时行乐，纵享生活！",

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			name: "qq",
			icon: "fa7-brands:qq",
			url: "https://qun.qq.com/universal-share/share?ac=1&authKey=3rTrgLKyN1q7%2BIJbmRBrsJc%2BnKTGfliRw9YX6WxKpi9kQZ5ER8vaq%2FypNWkJ1%2B1D&busi_data=eyJncm91cENvZGUiOiI3MTgwNzM4NzMiLCJ0b2tlbiI6IklULzZPbXN5bTl5N29RSEcxNkpwTENEUk93bU82TzdBTkltcDJSa3Q3UVVJb3hhK0dvK1djVzhZTmdtZU5RNkUiLCJ1aW4iOiIxNTkyNzU3NzQxIn0%3D&data=kZTKVbc-rum5FDjXI1csiq-3IxuZruROwm9hg7vRoHupUQ6Hi_CWc2NoA-NU4mbsM6DcyNN7X--ermYe5Dsxng&svctype=4&tempid=h5_group_info",
			showName: false,
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/dahailaila",
			showName: false,
		},
		{
			name: "Email",
			icon: "fa7-solid:envelope",
			url: "http://hhwzk.cc.cd/about/",
			showName: false,
		},
		
	],
};
