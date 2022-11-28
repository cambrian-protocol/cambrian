import { Box, Heading, Text } from 'grommet'
import { FilmScript, ListNumbers } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DropButtonListItem from '@cambrian/app/components/list/DropButtonListItem'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import SolverInfoModal from '../common/modals/SolverInfoModal'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { loadCommitWorkaround } from '@cambrian/app/services/ceramic/CeramicUtils'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface TemplatePreviewProps {
    template: TemplateModel
    showConfiguration?: boolean
}

const TemplatePreview = ({
    template,
    showConfiguration,
}: TemplatePreviewProps) => {
    const { currentUser } = useCurrentUserContext()
    const [templaterProfile] = useCambrianProfile(template.author)
    const [composition, setComposition] = useState<CompositionModel>()
    const [denominationToken, setDenominationToken] = useState<TokenModel>()
    const [showSolverConfigModal, setShowSolverConfigModal] = useState<number>() // Solver Index

    useEffect(() => {
        if (currentUser) init(currentUser)
    }, [currentUser])

    const init = async (currentUser: UserType) => {
        if (showConfiguration) {
            const _compositionDoc =
                await loadCommitWorkaround<CompositionModel>(
                    template.composition.commitID
                )
            if (_compositionDoc.content && _compositionDoc.content.solvers) {
                const mergedComposition = mergeFlexIntoComposition(
                    _compositionDoc.content,
                    template.flexInputs
                )

                setComposition(mergedComposition)
            }
        }

        setDenominationToken(
            await fetchTokenInfo(
                template.price.denominationTokenAddress,
                currentUser.web3Provider
            )
        )
    }

    return (
        <>
            <Box gap="medium">
                <BaseHeader
                    title={template.title}
                    metaTitle="Template Solver"
                    authorProfileDoc={templaterProfile}
                    items={
                        showConfiguration
                            ? [
                                  {
                                      label: 'Solver Configurations',
                                      dropContent: (
                                          <Box>
                                              {composition?.solvers.map(
                                                  (solver, idx) => (
                                                      <DropButtonListItem
                                                          key={idx}
                                                          label={
                                                              <Box width="medium">
                                                                  <Text>
                                                                      {
                                                                          solver
                                                                              .solverTag
                                                                              .title
                                                                      }
                                                                  </Text>
                                                                  <Text
                                                                      size="xsmall"
                                                                      color="dark-4"
                                                                      truncate
                                                                  >
                                                                      {
                                                                          solver
                                                                              .solverTag
                                                                              .description
                                                                      }
                                                                  </Text>
                                                              </Box>
                                                          }
                                                          icon={<FilmScript />}
                                                          onClick={() =>
                                                              setShowSolverConfigModal(
                                                                  idx
                                                              )
                                                          }
                                                      />
                                                  )
                                              )}
                                          </Box>
                                      ),
                                      dropAlign: {
                                          top: 'bottom',
                                          right: 'right',
                                      },
                                      dropProps: {
                                          round: {
                                              corner: 'bottom',
                                              size: 'xsmall',
                                          },
                                      },
                                      icon: (
                                          <ListNumbers
                                              color={
                                                  cpTheme.global.colors[
                                                      'dark-4'
                                                  ]
                                              }
                                          />
                                      ),
                                  },
                              ]
                            : []
                    }
                />
                <Box gap="small">
                    <Heading level="3">Project details</Heading>
                    <Text style={{ whiteSpace: 'pre-line' }}>
                        {template.description}
                    </Text>
                </Box>
                {template.requirements.length > 0 && (
                    <Box gap="small">
                        <Heading level="4">Requirements</Heading>
                        <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                            {template.requirements}
                        </Text>
                    </Box>
                )}
                <PlainSectionDivider />
                <PriceInfo
                    label="Price"
                    amount={template.price.amount || 0}
                    token={denominationToken}
                    allowAnyPaymentToken={template.price.allowAnyPaymentToken}
                    preferredTokens={template.price.preferredTokens}
                />
                <PlainSectionDivider />
                {templaterProfile && (
                    <Box gap="small">
                        <Heading level="4">About the author</Heading>
                        <CambrianProfileAbout
                            cambrianProfile={templaterProfile}
                        />
                    </Box>
                )}
            </Box>
            {showSolverConfigModal !== undefined && composition && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigModal(undefined)}
                    composition={composition}
                    composerSolver={composition.solvers[showSolverConfigModal]}
                    price={{
                        amount: template.price.amount,
                        token: denominationToken,
                    }}
                />
            )}
        </>
    )
}

export default TemplatePreview
