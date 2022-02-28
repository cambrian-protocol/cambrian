import Actionbar from '../../interaction/bars/Actionbar'

interface WriterActionbarProps {
    onSubmitWork: () => Promise<void>
}
const WriterActionbar = ({ onSubmitWork }: WriterActionbarProps) => {
    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        label: 'Submit work',
                        onClick: onSubmitWork,
                    },
                }}
            />
        </>
    )
}

export default WriterActionbar
