import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const Style = styled.div`
a {
  text-decoration: none !important;
  font-weight: normal;
}
a:hover{
  text-decoration: underline !important;
}
`

export default function RouterLink(props) {
  return <Style>
    <Link {...props}/>
  </Style>
}
