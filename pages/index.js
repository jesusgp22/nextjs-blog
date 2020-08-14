import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import Date from '../components/date'
import { getSortedPostsData } from '../lib/posts'



export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hello! I'm <b>Jesus</b>, Software Engineer 🧙🏻‍♂️ and creator 🔮. Currently working as Front-end Expert for <a href="https://etale.com">Etale</a></p>
        <p>Living at Bogotá, Colombia </p>
        <p>Github: <b><a href="https://github.com/jesusgp22">@jesusgp22</a></b></p>
        <p>Linkedn: <b><a href="https://www.linkedin.com/in/jesusgp22/">in/jesusgp22</a></b></p>
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href="/posts/[id]" as={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>

          ))}
        </ul>
      </section>

      <section className={utilStyles.headingMd}>
        <h4 className={utilStyles.headingLg}>About me</h4>
        <p>6+ years designing, developing and deploying amazing web apps. Most of my experience comes from e-commerce, B2B Crypto/HFT apps and analytics</p>
        <p>I'm passionate about turning data into pixels, React and the web</p>
        <p>Currently learning 👨🏻‍💻: JAMSTACK</p>
      </section>

    </Layout>
  )
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}
