type ConditionalWrapperProps = {
    condition?: boolean
    wrapper: (children: React.ReactElement) => JSX.Element
    children: React.ReactElement
}

export const ConditionalWrapper = ({
    condition,
    wrapper,
    children,
}: ConditionalWrapperProps) => (condition ? wrapper(children) : children)
