import {
    ComposerModuleDataInputType,
    ComposerModuleModel,
} from '@cambrian/app/models/ModuleModel'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ModuleConfigForm from '../forms/ModuleConfigForm'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface UpdateModuleModalProps {
    onClose: () => void
    module: ComposerModuleModel
}

const UpdateModuleModal = ({ onClose, module }: UpdateModuleModalProps) => {
    const { dispatch } = useComposerContext()
    const [inputs, setInputs] = useState<
        ComposerModuleDataInputType[] | undefined
    >(module.dataInputs)
    const onSubmit = () => {
        dispatch({
            type: 'UPDATE_MODULE',
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
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={module.name}
                subTitle={'Update Module'}
                paragraph={module.description}
            />
            <ModuleConfigForm
                onSubmit={onSubmit}
                module={module}
                inputs={inputs}
                setInputs={setInputs}
                submitLabel="Save"
            />
        </BaseLayerModal>
    )
}

export default UpdateModuleModal
