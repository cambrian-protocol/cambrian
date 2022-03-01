import Actionbar from '../../interaction/bars/Actionbar'

interface WriterActionbarProps {
    onSubmitWork: () => Promise<void>
    hasWorkChanged: boolean
}
const WriterActionbar = ({
    onSubmitWork,
    hasWorkChanged,
}: WriterActionbarProps) => {
    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        disabled: hasWorkChanged,
                        label: 'Submit work',
                        onClick: onSubmitWork,
                    },
                }}
            />
        </>
    )
}

export default WriterActionbar
