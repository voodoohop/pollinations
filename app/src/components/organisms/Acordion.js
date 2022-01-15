import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


export default function Acordion({header, defaultExpanded, children}) {

  return <Accordion defaultExpanded={defaultExpanded} style={{backgroundColor: 'transparent', boxShadow: 'none', padding: 0}}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header">
            <h3>
              {header}
            </h3>
        </AccordionSummary>
        
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
}