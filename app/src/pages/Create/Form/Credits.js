import { Accordion, AccordionSummary } from "@material-ui/core";
import styled from '@emotion/styled';
import Markdown from "markdown-to-jsx"
import Add from '@material-ui/icons/Add';
import useMarkdown from "../../../hooks/useMarkdown";
import { useEffect, useState } from "react";

export default function CreditsView({ credits, title, isMarkdown }){
    const [ content, setContent ] = useState(credits)

    useEffect(() => {
        if (!credits) return null;
        if (!isMarkdown) return null;

        async function GetMarkdown() {
            return await fetch(credits)
            .then(res => res && res.text())
            .then(md => md && setContent(md))
        }
        GetMarkdown()
    }, [])


    if (!content) return null;


    return <Accordion elevation={0} fullWidth defaultExpanded={true}>
        <AccordionSummary expandIcon={<Add />} fullWidth>
            {title || 'Credits'}
        </AccordionSummary>

        <Style>
            <Markdown>
                {content}
            </Markdown>
        </Style>
    </Accordion>
}
const Style = styled.div`
width: 100%;
`