import { navBar } from '../nav-bar.ts'
interface Props {
  title: string
  slot: string
  js?: string[]
  css?: string[]
}

export const appLayout = ({ title, slot, js, css }: Props): string => {
  return /*html*/ `
		<!DOCTYPE html>
		<html lang="es">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${config.appName} - ${title}</title>
				<link rel="stylesheet" href="/public/css/main.css">
				${css?.map((href) => `<link rel="stylesheet" href="public/css/${href}">`).join('\n') ?? ''}
			</head>
			<body data-theme="dark">
				<header>
					${navBar({})}
				</header>
				
				<main>
					${slot}
				</main>
				
				<footer>
					<!-- Footer content -->
				</footer>
				
				<script type="module" src="/public/js/global.js"></script>
				${js?.map((src) => `<script src="public/js/${src}"></script>`).join('\n') ?? ''}
			</body>
		</html>
	`
}
