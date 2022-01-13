import Box from '@material-ui/core/Box'
import MarkDownContent from '../molecules/MarkDownContent'

// HERO 
// Component
const HeroSection = props => <Box paddingTop={3} minHeight='30vh'>

  <Box maxWidth='500px' margin='auto'>
    {/* <MarkdownContent id="landingLeft" /> */}
    <br/>
    <MarkDownContent id="landingRight" />
  </Box>

</Box>

export default HeroSection