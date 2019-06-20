import React, { PropTypes } from "react"
import { Link } from "phenomic"
import logo from "../icons/BC-logo-large.png"
import wallpaper from "../../../content/assets/decor-building.png"

import styles from "./index.css"

const Header = () => (
  <header className={ styles.header }>
    <nav className={ styles.nav }>
      <Link
        className={ styles.link }
        to={ "/" }
      >
        <img className={ styles.logo} src={ logo } width="200" height="80"/>
      </Link>

      <div className={ styles.navPart1 }>
        <Link
          className={ styles.link }
          to={ "/" }
        >
          { "About Company" }
        </Link>
        <Link
          className={ styles.link }
          to={ "/members/" }
        >
          { "Who We Are" }
        </Link>
        <Link
          className={ styles.link }
          to={ "/experience/" }
        >
          { "Industry Experience" }
        </Link>
        <Link
          className={ styles.link }
          to={ "/careers/" }
        >
          { "Careers" }
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
