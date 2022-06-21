import { Button } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import { useNavigate } from "react-router-dom"
import { textContent } from "../assets"
import Logo from '../components/Logo'
import MarkdownContent from "../components/molecules/MarkDownContent"
import PageTemplate from "../components/PageTemplate"
import styled from "@emotion/styled"



export default function Home() {


  const navigate = useNavigate()

  return <>
    <Box 
      paddingTop={4} 
      display='flex' 
      flexDirection='column' 
      alignItems='center'>
      
      <Logo/>
      
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        // gridTemplateColumns="repeat(auto-fill, minmax(300px, 2fr))"
        gridGap="1em"
        // minHeight=""
        // maxHeight="100vh"
        // padding="0em 0"
        margin='2em'
        marginBottom="8em"
      >
        <TextColor>
          <MarkdownContent 
            style={{color: '#F9F7F0'}}
            url={textContent.landingLeft} />
        </TextColor>
        <Button 
            style={{
              marginTop: '3em', 
              backgroundColor: 'CEE480',
            }}
            variant='contained'
            onClick={()=> navigate('/c')}
            color="primary"  
            target="colab">
            Create
        </Button>

      </Box>

      <PageTemplate label='landing' />

    </Box>
  </>
}

const TextColor = styled.div`
h5 {
  
  color: #F9F7F0 !important;
}
  `

