import React from "react"
import Link from "next/link"
import styles from "./navigation.module.css"

export default () => (
  <nav role="navigation">
    <ul className={styles.navigation}>
      <li className={styles.navigationItem}>
        <Link href="/"><a>Home</a></Link>
      </li>
      <li className={styles.navigationItem}>
        <Link href="/blog/"><a>Blog</a></Link>
      </li>
    </ul>
  </nav>
)
