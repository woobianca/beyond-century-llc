import React, { PropTypes } from "react"
import { Link } from "phenomic"
import logo from "../icons/BC-logo-large.png"
import wallpaper from "../../../content/assets/decor-building.png"

import styles from "./index.css"

const Header = () => (
  <header className={ styles.header }>
    <nav className={ styles.nav }>
    <img className={ styles.logo} src={ logo } width="160" height="60"/>

      <div className={ styles.navPart1 }>
        <Link
          className={ styles.link }
          to={ "/" }
        >
          { "About Company" }
        </Link>
        <Link
          className={ styles.link }
          to={ "/members" }
        >
          { "Who We Are" }
        </Link>
        <Link
          className={ styles.link }
          to={ "/experience" }
        >
          { "Industry Experience" }
        </Link>
      </div>
    </nav>
    <img className={ styles.wallpaper} src={ wallpaper }/>
  </header>
)

Header.contextTypes = {
  metadata: PropTypes.object.isRequired,
}

export default Header
