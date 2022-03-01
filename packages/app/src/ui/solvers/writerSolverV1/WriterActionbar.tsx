import Actionbar from '../../interaction/bars/Actionbar'

interface WriterActionbarProps {
    onSubmitWork: () => Promise<void>
    isLoading: boolean
    hasWorkChanged: boolean
}
const WriterActionbar = ({
    onSubmitWork,
    isLoading,
    hasWorkChanged,
}: WriterActionbarProps) => {
    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        disabled: hasWorkChanged,
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
