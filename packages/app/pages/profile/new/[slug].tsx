import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProfileWizard from '@cambrian/app/ui/profile/wizard/ProfileWizard'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function NewProfilePage() {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { slug, target } = router.query

    return (
        <>
            {currentUser && (
                <PageLayout kind="narrow">
                    <ProfileWizard
                        currentUser={currentUser}
                        successRoute={
                            slug && target
                                ? `/${target}/new/${slug}`
                                : undefined
                        }
                    />
                </PageLayout>
            )}
        </>
    )
}
