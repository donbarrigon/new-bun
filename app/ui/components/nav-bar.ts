interface Props {
  user?: any
  permissions?: any
}
export const navBar = ({}: Props) => {
  return /*html*/ `
		<!-- NAVBAR CYBERPUNK -->
		<nav class="cyberpunk-navbar">
			<div class="navbar-container">
				<!-- LOGO (IZQUIERDA) -->
				<div class="navbar-logo">
					<div class="logo-text">New bun</div>
				</div>
				
				<!-- NAVEGACIÓN (CENTRO) -->
				<ul class="navbar-nav">
					<li class="nav-item">
						<a href="/" class="nav-link">Home</a>
					</li>
					<li class="nav-item">
						<a href="https://bun.com/" class="nav-link">Bun</a>
					</li>
					<li class="nav-item">
						<a href="https://github.com/donbarrigon/new-bun" class="nav-link">About</a>
					</li>
				</ul>
				
				<!-- BOTONES (DERECHA) -->
				<div class="navbar-buttons">
					<a href="/login" class="btn-cyberpunk btn-login">Login</a>
					<a href="/signup" class="btn-cyberpunk btn-signup">Sign Up</a>
				</div>
			</div>
		</nav>
	`
}
