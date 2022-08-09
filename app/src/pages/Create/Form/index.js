import styled from '@emotion/styled';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import CustomizeParameters from './CustomizeParameters';
import SelectModel from './SelectModel';
import PrimaryInput from './PrimaryInput';
import { getInitialValues, getInputs } from './utils';
import { useGPUModels } from '../../../hooks/useGPUModels';
import { CreateButton } from '../../Home/TryOut';


const Form = ({ ipfs, Results,
    onSubmit, isDisabled, 
    selectedModel, onSelectModel, hasSelect }) => {

  const formik = useFormik({
      initialValues: {},
      onSubmit,
      enableReinitialize: true,
  });
  const { models } = useGPUModels();

  useEffect(()=>{

    const { inputs, primary_input } = getInputs(models, selectedModel);
    const values = getInitialValues(inputs, primary_input)
    console.log(primary_input)
    // add other fields to the form when user selects the desired model.
    formik.setValues({ 
      // all parameters for the form
      ...values,
      
      // override the primary_input value with the old one.
      [primary_input.key]: formik.values[Object.keys(formik.values)[0]]
    })
  },[selectedModel, models])

  useEffect(()=>{
    console.log(formik.values)
  },[formik.values])

  useEffect(()=>{
    if (!ipfs.input) return;
    console.log(ipfs.input)
    formik.setValues({ ...formik.values, ...ipfs.input });
  },[ipfs?.input])
    
  return <StyledForm onSubmit={formik.handleSubmit} >

    { hasSelect &&
      <SelectModel 
        models={models} 
        isDisabled={isDisabled}
        selectedModel={selectedModel} 
        onSelectModel={onSelectModel}
      />
    }

      <>

        <PrimaryInput
          isDisabled={isDisabled || !selectedModel.key}
          formik={formik}
          models={models}
          selectedModel={selectedModel}
        />
        
        <ParametersAndResultsStyled>

          <CustomizeParameters
            isDisabled={isDisabled}
            inputs={models[selectedModel?.key]?.components.schemas.Input.properties}
            formik={formik}
            />
          {Results}
        </ParametersAndResultsStyled>

      </>


  </StyledForm>
};
export default Form;


const StyledForm = styled.form`
display: flex;
flex-direction: column;
align-items: center;
gap: 2em;
width: 100%;
`

const ParametersAndResultsStyled = styled.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 1em;
width: 100%;
`

