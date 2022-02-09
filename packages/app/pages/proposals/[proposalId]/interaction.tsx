import Actionbar, {
    ActionbarActionsType,
} from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Chats, Handshake } from 'phosphor-react'
import { useEffect, useState } from 'react'

import ChatModal from '@cambrian/app/components/modals/ChatModal'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import InteractionSidebar from '@cambrian/app/ui/interaction/bars/InteractionSidebar'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import SolverConfigInfo from '@cambrian/app/ui/interaction/config/SolverConfigInfo'
import { Text } from 'grommet'
import { useCurrentSolver } from '@cambrian/app/src/hooks/useCurrentSolver'
import { useCurrentUserOrSigner } from '@cambrian/app/src/hooks/useCurrentUserOrSigner'

export default function InteractionPage() {
    const { currentUser, setCurrentUserRole } = useCurrentUserOrSigner()
    const { currentSolverConfig } = useCurrentSolver()
    const [showChatModal, setShowChatModal] = useState(false)

    const [currentActions, setCurrentActions] = useState<ActionbarActionsType>({
        primaryAction: { label: 'Claim tokens' },
        info: {
            icon: <Handshake />,
            descLabel: 'You have earned',
            label: '400 WRK',
        },
    })

    const toggleShowChatModal = () => setShowChatModal(!showChatModal)

    useEffect(() => {
        // Set role
        /*         switch (currentUser?.address) {
            case currentSolverConfig?.keeper:
                setCurrentUserRole('Keeper')
                break
            case currentSolverConfig?.arbitrator:
                setCurrentUserRole('Arbitrator')
                break
            default:
                setCurrentUserRole('Public')
        }
 */
        // TODO Keeper must pick a writer and fill in the address - Then the solve will be executed
        // Keeper might have some manual slots to fill. Everybody else show a 'In progress, wait until Keeper has kicked off' - screen.
        // The screen for the Keeper should include all manual slots he needs to input ( MVP writer address) and then a button with executSolve()
    }, [])

    return (
        <>
            <Layout
                contextTitle="Interact"
                sidebar={<InteractionSidebar />}
                config={<SolverConfigInfo />}
                actionBar={<Actionbar actions={currentActions} />}
                floatingActionButton={
                    <FloatingActionButton
                        icon={<Chats />}
                        onClick={toggleShowChatModal}
                    />
                }
            >
                <OutcomeNotification
                    title="Outcome has been proposed!"
                    message="Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                    canRequestArbitration
                    outcomeCollection={{
                        id: '123141',
                        outcomes: [
                            {
                                id: '91874fgaga391875',
                                title: 'Success',
                                description:
                                    'Success description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.',
                                uri: 'URI',
                                context: ' context',
                            },
                            {
                                id: '9187491awfawf875',
                                title: 'Time exceeded',
                                description:
                                    'Time exceeded description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.',
                                uri: 'URI',
                                context: ' context',
                            },
                        ],
                    }}
                />
                <></>
                <HeaderTextSection
                    title="Work Content"
                    subTitle="Interaction screen"
                    paragraph="Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <Text>
                    Lorem Ipsum dolor sit amet consectetur adipisicing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.Lorem
                    Ipsum dolor sit amet consectetur adipisicing elit. Lorem
                    ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse vel erat et enim blandit pharetra. Nam nec justo
                    ultricies, tristique justo eget, dignissim turpis.
                </Text>
            </Layout>
            {showChatModal && <ChatModal onBack={toggleShowChatModal} />}
        </>
    )
}
