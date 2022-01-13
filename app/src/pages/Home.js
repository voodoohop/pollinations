import { useMemo } from "react"
import styled from '@emotion/styled'
import Markdown, { compiler } from "markdown-to-jsx"

import { getNotebooks } from "../data/notebooks"

import Alert from "@material-ui/lab/Alert"
import RouterLink from "../components/molecules/RouterLink"
import HeroSection from '../components/organisms/HeroSection'
import HorizontalList from '../components/organisms/HorizontalList'


export default function Home({ ipfs }) {

  const notebooks = useMemo(() => getNotebooks(ipfs), [ipfs])
  const notebooksByCategory = groupBy(notebooks, notebook => notebook.category) || []
  
  return <>

    { // in case notebook list is not available
      !Object.entries(notebooks).length && <Alert severity="error">
        Model list temporarily unavailable. Please retry in a little while
      </Alert>
    }

    <HeroSection />
    
    {
      Object.entries(notebooksByCategory)
      .splice(0, 3)
      .map( category => 
        <HorizontalList title={parseCategory(category[0])}>
          {
            category[1]?.map( notebook => 
              <NotebookHomeCard key={notebook.name} {...notebook} />
            )
          }
        </HorizontalList>
      )
    }
  </>
}







// Cards 
// Component

const NotebookHomeCard = ({ name, path, description }) => {

  // different markdown nesting
  // gambiarra for the img
  const md_compiler = compiler(description, { wrapper: null })
  const img_source = md_compiler[0]?.props?.src || md_compiler[0]?.props?.children[0]?.props?.src

  return <NotebookHomeCardStyle>

    <h3>
      <RouterLink to={path}>
        {name?.slice(2)}
      </RouterLink>
    </h3>

    <img src={img_source} style={{ width: '100%' }} />

    <Markdown options={MarkDownOptions}>
      {description}
    </Markdown>

  </NotebookHomeCardStyle>
}
const NotebookHomeCardStyle = styled.div`

> h3 {
  padding: 0.5em 0;
}

`

// surprise, it's a div instead!
const gambiarraImg = ({ children, ...props }) => (
  <div />
)
const MarkDownOptions = {
  overrides: {
    img: { component: gambiarraImg }
  }
}
// convenience
// move elsewhere
const parseCategory = category => `${category.split('-')[0].slice(2)} > ${category.split('-')[2]}`
function groupBy(xs, f) {
  return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}