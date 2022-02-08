import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/ConditionModel'

type OutcomeCollectionModalProps = BaseLayerModalProps & {}

// TODO Map outcomes
const OutcomeCollectionModal = (props: OutcomeCollectionModalProps) => {
    const dummyOcs: OutcomeCollectionModel[] = [
        {
            id: 'oij1oiuyo1i5u019u5',
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
        },
        {
            id: 'f2f2fq2ggagag',
            outcomes: [
                {
                    id: '918749faaf875',
                    title: 'Success',
                    description:
                        'Success description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.',
                    uri: 'URI',
                    context: ' context',
                },
            ],
        },
        {
            id: 'aga234twy3s4hseyhsh',
            outcomes: [
                {
                    id: '9187492352gfwgh1875',
                    title: 'Failure',
                    description:
                        'Success description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.',
                    uri: 'URI',
                    context: ' context',
                },
            ],
        },
    ]

    return (
        <BaseLayerModal {...props}>
            <HeaderTextSection
                title="Outcomes"
                subTitle="What can happen?"
                paragraph="Outcome description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                {dummyOcs.map((oc) => (
                    <OutcomeCollectionCard
                        key={oc.id}
                        outcomeCollection={oc}
                        proposable
                    />
                ))}
            </Box>
        </BaseLayerModal>
    )
}

export default OutcomeCollectionModal
