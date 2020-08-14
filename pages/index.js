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
        <p>Location: Bogotá, Colombia, available for Remote Work 🌎</p>
        <p>Github: <b><a href="https://github.com/jesusgp22" target='_blank'>@jesusgp22</a></b></p>
        <p>Linkedn: <b><a href="https://www.linkedin.com/in/jesusgp22/" target='_blank'>in/jesusgp22</a></b></p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, ts, title, slug }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href="/posts/[slug]" as={`/posts/${slug}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date ts={ts} />
              </small>
            </li>

          ))}
        </ul>
      </section>
      <hr className={`${utilStyles.sectionSeparator}`}/>
      <section className={utilStyles.headingSm}>
        <h4 className={utilStyles.headingMd}>About me</h4>
        <p>6+ years designing, developing and deploying amazing web apps. Most of my experience comes from e-commerce, B2B Crypto/HFT apps and analytics</p>
        <p>I'm passionate about turning data into pixels, React and the web</p>
        <p>Graduated as Computer Systems Engineer at <b><a href="http://www.ula.ve" target='_blank'>ULA</a></b></p>
        <p>Currently learning 👨🏻‍💻: JAMSTACK</p>
      </section>

    </Layout>
  )
}

export async function getStaticProps() {
  const allPostsData = await getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}
