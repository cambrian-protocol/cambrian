import BaseComposerListItem from '@cambrian/app/components/list/BaseComposerListItem'
import { ComposerModuleModel } from '@cambrian/app/models/ModuleModel'
import { Plug } from 'phosphor-react'
import UpdateModuleModal from './modals/UpdateModuleModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface ComposerModuleListItemProps {
    module: ComposerModuleModel
}

const ComposerModuleListItem = ({ module }: ComposerModuleListItemProps) => {
    const { dispatch } = useComposerContext()
    const [showUpdateModuleModal, setShowUpdateModuleModal] = useState(false)

    const toggleUpdateModuleModal = () =>
        setShowUpdateModuleModal(!showUpdateModuleModal)

    const handleDeleteModule = () => {
        dispatch({ type: 'DELETE_MODULE', payload: { key: module.key } })
    }

    return (
        <>
            <BaseComposerListItem
                title={module.name}
                description="Module"
                icon={<Plug />}
                onRemove={handleDeleteModule}
                onEdit={
                    module.dataInputs && module.dataInputs?.length > 0
                        ? toggleUpdateModuleModal
                        : undefined
                }
            />
            {showUpdateModuleModal && (
                <UpdateModuleModal
                    module={module}
                    onClose={toggleUpdateModuleModal}
                />
            )}
        </>
    )
}

export default ComposerModuleListItem
