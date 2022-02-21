import { useState, useCallback, useMemo  } from 'react'
import styled from '@emotion/styled';

import { getNotebooks } from '../data/notebooks';
import { getNotebookMetadata } from '../utils/notebookMetadata';

import useIPFS from '../hooks/useIPFS';
import useIPFSWrite from '../hooks/useIPFSWrite';

import Box from '@material-ui/core/Box';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'

import FormView from '../components/Form';

const StepperHeader = ({ steps, activeStep }) => {

    return <>
        <Stepper activeStep={activeStep} orientation="vertical" >
            {steps.map((step, index) => {
            const stepProps = {};
            const labelProps = {};
            
            return (
                <Step key={step} {...stepProps}>
                <StepLabel {...labelProps}>{step.label}</StepLabel>
                </Step>
            );
            })}
        </Stepper>
    </>
}
const StepperFooter = ({ steps, stepState }) => {

    const [ step, setStep ] = stepState

    const handleNext = () => setStep((prevActiveStep) => prevActiveStep + 1)
    const handleBack = () => setStep((prevActiveStep) => prevActiveStep - 1)
    
    return <>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button disabled={step === 0} onClick={handleBack}>
              [ Back ]
            </Button>
        <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleNext}>
              [ {step === steps.length - 1 ? 'Finish' : 'Next'} ]
            </Button>
        </Box>
    </>
}



const Wizard = ({ node, navigateToNode, overrideContentID  }) => {

    const stepState = useState(0);

    const ipfsNotebooks = useIPFS("/ipns/k51qzi5uqu5dk56owjc245w1z3i5kgzn1rq6ly6n152iw00px6zx2vv4uzkkh9");
    const notebooks = getNotebooks(ipfsNotebooks)[1]

    const selection = useState({
        notebook: '',
        category: ''
    })



    return <>
    
    <Box sx={{ width: '100%' }}>

        
      
        <Style>
            <StepperHeader steps={steps} activeStep={stepState[0]}/>
            { steps[stepState[0]]?.children({ notebooks, selection, node, navigateToNode, overrideContentID })}

        </Style>  
              
        <StepperFooter steps={steps} stepState={stepState} />
    </Box>

    </>
}



const WhatDoyouWanttoCreate = ({ notebooks,  selection }) => {
    function handleChange(e){
        e.preventDefault()
        selection[1]( state => ({ ...state, category: e.target.value }) )
    }
    return <div>
        <h4>
            What do you want do create?
        </h4>
        <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
        sed diam voluptua
        </p>
        
        <Select onChange={handleChange} value={selection[0].category} fullWidth>
            
            {   
                Object.keys(notebooks)
                .map(notebook => <MenuItem value={notebook}>
                    {notebook}
                </MenuItem> 
                )  
            }
            
        </Select>
    </div>
}

const SelectModel = ({ notebooks,  selection }) => {
    function handleChange(e){
        e.preventDefault()
        let category = notebooks[selection[0].category]
        let selected = category.find( notebook => notebook.name === e.target.value).path
        
        selection[1]( state => ({ 
            ...state, 
            notebook: { 
                name: e.target.value,
                cid: selected.slice(3).slice(0, -7)
            }  
        }) )
    }
    return <div>
    <h4>
        Which AI model do you want to use?
    </h4> 
    <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
        sed diam voluptua
    </p>
    <TextField label='Category' value={selection[0].category || ''} fullWidth disabled />
    <br/>
    <br/>
    <Select onChange={handleChange} value={selection[0].notebook.name} fullWidth>     
        {  
            Object.values( notebooks[selection[0].category] )
            .map( notebook => <MenuItem value={notebook.name}>
                {notebook.name}
            </MenuItem>)
            
        }
    </Select>
    </div>
}



const FormInputs = ({ selection, node, navigateToNode, overrideContentID }) => {
    
    const contentID = selection[0].notebook.cid
    const ipfs = useIPFS(contentID);
    const dispatchInput = useIPFSWrite(ipfs, node)

    const dispatch = useCallback(async inputs => {

        const contentID = await dispatchInput(inputs)
        if (overrideContentID)
            overrideContentID(contentID)
        navigateToNode()

    }, [ipfs?.input, dispatchInput])

    // should be useContext!
    const { connected } = node

    const metadata = useMemo(() => getNotebookMetadata(ipfs), [ipfs?.input])

    return <div>
    <h4>
        Select Inputs
    </h4>
    <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. 
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, 
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
        sed diam voluptua
    </p>
    <FormView
        input={ipfs?.input}
        connected={connected}
        metadata={metadata}
        onSubmit={dispatch} />
    
    </div>
}

const ConfirmAndSubmit = props => {

    return <>
        <h2>
            Review and Submit
        </h2>
        <p>
            Pollinations offers blablablabla
        </p>
    </>
}
const steps = [
    { label: 'What do you want to create?', children: props => <WhatDoyouWanttoCreate {...props}/> }, 
    { label: 'Select AI Model', children: props => <SelectModel {...props} /> }, 
    { label: 'Select Inputs', children: props => <FormInputs {...props} /> }, 
    { label: 'Submit', children: props => <ConfirmAndSubmit {...props} /> }
]

const Style = styled.div`
min-height: 50vh;
display: grid;
grid-template-columns: 20% 1fr;
grid-gap: 4em;
align-items: flex-start;

> div {
    padding: 1em;

    > p {
        margin-bottom: 1em;
    }
}
> h2, h3, h4 {
    margin: 0;
}

`
export default Wizard

