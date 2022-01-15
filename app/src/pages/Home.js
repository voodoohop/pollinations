import styled from '@emotion/styled'
import Markdown, { compiler } from "markdown-to-jsx"

import { getNotebooks } from "../data/notebooks"
import useIPFS from "../hooks/useIPFS"

import Alert from "@material-ui/lab/Alert"
import RouterLink from "../components/molecules/RouterLink"
import HeroSection from '../components/organisms/HeroSection'
import HorizontalList from '../components/organisms/HorizontalList'


function Home() {

  const ipfs = useIPFS("/ipns/k51qzi5uqu5dk56owjc245w1z3i5kgzn1rq6ly6n152iw00px6zx2vv4uzkkh9");
  const notebooks = getNotebooks(ipfs)[1]
  
  return <>

    { 
    // in case notebook list is not available
      !Object.entries(notebooks).length && <Alert severity="error">
        Model list temporarily unavailable. Please retry in a little while
      </Alert>
    }

    <HeroSection />

    <CategoriesContainer>
    {
      Object.entries(notebooks)
      .map( (category, idx) => 
        <HorizontalList key={category[0]} title={parseCategory(category[0])} Idx={idx}>
          {
            category[1]?.splice(0,4).map( notebook => 
              <NotebookHomeCard key={notebook.name} {...notebook} />
            )
          }
        </HorizontalList>
      )
    }
    </CategoriesContainer>
  </>
}

export default Home

const CategoriesContainer = styled.div`
width: 100%;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(1fr, 100%));
`





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
const gambiarraImg = () => <div />

const MarkDownOptions = {
  overrides: {
    img: { component: gambiarraImg }
  }
}
// convenience
// move elsewhere
const parseCategory = category => `${category.split('-')[0].slice(2)} > ${category.split('-')[2]}`
