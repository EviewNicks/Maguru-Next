import Logo from './Navbar/Logo'
import DarkMode from './Navbar/DarkMode'
import CartButton from './Navbar/CartButton'
import NavSearch from './Navbar/NavSearch'
import Container from './Container'
import { LinksDropdown } from './Navbar/LinksDropdown'

function Navbar() {
  return (
    <nav className="border-b ">
      <Container className="flex flex-col sm:flex-row  sm:justify-between sm:items-center flex-wrap gap-4 py-6">
        <Logo />
        <NavSearch />
        <div className="flex gap-4 items-center ">
          <CartButton />
          <LinksDropdown />
          <DarkMode />
        </div>
      </Container>
    </nav>
  )
}
export default Navbar
