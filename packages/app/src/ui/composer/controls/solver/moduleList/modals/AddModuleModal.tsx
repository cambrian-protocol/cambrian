import {
    ModuleDataInputType,
    ModuleModel,
} from '@cambrian/app/models/ModuleModel'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ModuleConfigForm from '../forms/ModuleConfigForm'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface AddModuleModalProps {
    onClose: () => void
    onBack: () => void
    module: ModuleModel
}

const AddModuleModal = ({ onClose, onBack, module }: AddModuleModalProps) => {
    const { dispatch } = useComposerContext()
    const [inputs, setInputs] = useState<ModuleDataInputType[] | undefined>(
        module.dataInputs?.map((input) => {
            return { ...input, value: '', type: input.type }
        })
    )
    const onSubmit = () => {
        dispatch({
            type: 'ADD_MODULE',
            payload: {
                ...module,
                dataInputs: inputs?.map((input) => {
                    return { ...input, value: input.value, type: input.type }
                }),
            },
        })
        onClose()
    }

    return (
        <BaseLayerModal onClose={onBack}>
            <HeaderTextSection
                title={module.name}
                subTitle={'Add Module'}
                paragraph={module.description}
            />
            <ModuleConfigForm
                onSubmit={onSubmit}
                module={module}
                inputs={inputs}
                setInputs={setInputs}
                submitLabel="Add Module"
            />
        </BaseLayerModal>
    )
}

export default AddModuleModal
