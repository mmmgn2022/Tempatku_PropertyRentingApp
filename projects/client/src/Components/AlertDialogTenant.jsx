import React from 'react'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    useDisclosure
} from '@chakra-ui/react'
import axios from 'axios'
import { useState } from 'react'

export default function AlertDialogTenant(props) {
    const [loadingButton, setLoadingButton] = useState(false)
    let token = localStorage.getItem("tempatku_login");

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    const updateTransactionStatus = async () => {
        try {
            setLoadingButton(true)
            let update = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/transaction/status`, {
                transaction_statusId: 5, // 5 = cancel
                uuid: props.uuidTransaction
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            props.getSummary()
            setLoadingButton(false)
        } catch (error) {
            console.log(error);
        }
    }

    const handleCancel = () => {
        updateTransactionStatus();
        props.getSummary();
        props.getActionsNeeded();
        onClose();
    }

    return (
        <>
            <Button colorScheme='red' variant={'outline'} onClick={onOpen}
                isDisabled={props.status === 'Waiting for payment' || props.status === 'Reject' ? false : true}
                isLoading={loadingButton}
            >
                Cancel Order
            </Button>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Cancel Order
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleCancel} ml={3}
                                isLoading={loadingButton}>
                                Save
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}
