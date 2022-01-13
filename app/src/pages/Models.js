import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import Alert from "@material-ui/lab/Alert"
import Debug from "debug"
import Markdown, { compiler } from "markdown-to-jsx"
import { useMemo } from "react"
import MarkdownContent from "../components/molecules/MarkDownContent"
import RouterLink from "../components/molecules/RouterLink"
import { getNotebooks } from "../data/notebooks"
import useFilter from "../hooks/useFilter"


const debug = Debug("home");

export default function Models({ ipfs }) {

  const notebooks = useMemo(() => getNotebooks(ipfs), [ipfs]);
  const { notebookList, options, option } = useFilter(notebooks, false)

  debug("got notebooks", notebooks);
  return <>
    {
      !options.length && <Alert severity="error">Model list temporarily unavailable. Please retry in a little while</Alert>
    }

    <Box margin='calc(1.5em + 50px) 0 1.5em 0'>
      <FilterView options={options} option={option}/>
    </Box>

    <Box display='grid' gridGap='2em' gridTemplateColumns='repeat(auto-fill, minmax(300px, 1fr))'>
      {
        notebookList
          .map(notebook =>
            <NotebookCard key={notebook.name} notebook={notebook} />
          )
      }
    </Box>
  </>
}



const FilterView = ({ options, option }) => {
  return options.length ?
  <div style={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', }}>
    <Typography className='Lato'
      variant="h4" gutterBottom>

      What do you want to create?

    </Typography>

    <Box display='flex' alignItems='center'  marginBottom='2em'>
      {
        options?.map(opt =>
          <Button key={opt}
            style={{ margin: '0 0.5em' }}
            variant={opt === option?.selected ? 'contained' : 'outlined'}
            color={opt === option?.selected ? 'secondary' : 'primary'}
            onClick={() => option?.setSelected(opt)} >
            {opt}
          </Button>
        )
      }
    </Box>
  </div>
  :
  <></>
}







// Cards 
// Component

const NotebookCard = ({ notebook }) => {
  let test = compiler(notebook.description, { wrapper: null })

  const { category, name, path, description } = notebook

  return <Box>
    {/* <Card style={CardContainerStyle} >

      <CardHeader
        subheader={<CardTitle children={name?.slice(2)} to={path} variant='h5' />}
        title={<CardTitle children={parseCategory(category)} to={path} variant='h6' />} />

      <img src={
        test[0]?.props?.src ?
          test[0]?.props?.src
          : test[0]?.props?.children[0]?.props?.src}
        style={{ width: '100%' }} />

      <CardContent>
      {console.log()}

        <Markdown options={MarkDownOptions}>
          {description}
        </Markdown>
      </CardContent>

    </Card> */}
  </Box>
}

const CardTitle = ({ to, children, variant }) => <>
  <Typography className='Lato noMargin' variant={variant} gutterBottom>
    <RouterLink to={to}>
      {children}
    </RouterLink>
  </Typography>
</>

// surprise, it's a div instead!
const gambiarraImg = ({ children, ...props }) => (
  <div />
)
const MarkDownOptions = {
  overrides: {
    img: { component: gambiarraImg }
  }
}

const parseCategory = category => `${category.split('-')[0].slice(2)} > ${category.split('-')[2]}`