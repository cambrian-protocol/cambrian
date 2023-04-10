import { TextInput, TextInputProps } from 'grommet'

import styled from 'styled-components'

const NumberInput = ({ value, name, onChange, disabled }: TextInputProps) => {
    return (
        <TextInputWihtoutArrows
            disabled={disabled}
            value={value}
            name={name}
            onChange={onChange}
            onWheel={(e: any) => e.target.blur()}
            style={{
                fontSize: 24,
                fontWeight: 'bold',
                border: 'none',
            }}
            type="number"
            min={0}
            step={0.0000001}
            placeholder="0"
        />
    )
}

export default NumberInput

// Disable number arrows and spinner
const TextInputWihtoutArrows = styled(TextInput)`
    /* Chrome, Safari, Edge, Opera */
    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    -moz-appearance: textfield;
`
