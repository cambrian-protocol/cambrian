import React, { PropsWithChildren, useEffect } from 'react'

import BaseModal from './BaseModal'

type CommentsModalProps = PropsWithChildren<{}> & {
    onClose: () => void
}
const CommentsModal = ({ onClose, children }: CommentsModalProps) => {
    useEffect(() => {
        /* 
        TODO Fetch comments
        
        */
    }, [])

    return <BaseModal onClose={onClose}></BaseModal>
}

export default CommentsModal
