import { Accordion, AccordionSummary } from "@material-ui/core";
import styled from '@emotion/styled';
import Markdown from "markdown-to-jsx"
import Add from '@material-ui/icons/Add';

export default function CreditsView({ credits, title, props }){

    if (!credits) return null;
    
    return <Accordion elevation={0} fullWidth defaultExpanded={true}>
        <AccordionSummary expandIcon={<Add />} fullWidth>
            {title || 'Credits'}
        </AccordionSummary>

        <Style>
            <Markdown>
                {credits}
            </Markdown>
        </Style>
    </Accordion>
}
const Style = styled.div`
width: 100%;
`