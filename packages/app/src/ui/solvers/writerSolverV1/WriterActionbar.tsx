import Actionbar from '../../interaction/bars/Actionbar'

interface WriterActionbarProps {
    onSubmitWork: () => Promise<void>
    isLoading: boolean
}
const WriterActionbar = ({ onSubmitWork, isLoading }: WriterActionbarProps) => {
    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        isLoading: isLoading,
                        label: 'Submit work',
                        onClick: onSubmitWork,
                    },
                }}
            />
        </>
    )
}

export default WriterActionbar
