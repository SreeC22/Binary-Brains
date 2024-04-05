import React, { useState } from 'react';
import { useAuth } from '../Components/AuthContext';
import {Box, VStack, Input, Button, FormControl, FormLabel, useToast, useColorModeValue} 
    from '@chakra-ui/react';

const ProfileSettingsPage = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const toast = useToast();

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ email, username });
      toast({
        title: "Profile updated.",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Update failed.",
        description: "Unable to update profile, please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changePassword(currentPassword, newPassword);
      toast({
        title: "Password changed.",
        description: "Your password has been successfully changed.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Password change failed.",
        description: "Failed to change password, please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        // Redirect or do something once the account is deleted
      } catch (error) {
        toast({
          title: "Deletion failed.",
          description: "Failed to delete account, please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" w="full" p={8} bg={useColorModeValue('gray.100', 'gray.700')}>
      <VStack spacing={4} w="full" maxW="md" boxShadow="xl" p="6" rounded="lg" bg={useColorModeValue('white', 'gray.800')}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Username</FormLabel>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <Button colorScheme="teal" w="full" onClick={handleSubmitUpdate}>Update Profile</Button>
        
        <FormControl isRequired>
          <FormLabel>Current Password</FormLabel>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>New Password</FormLabel>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </FormControl>
        <Button colorScheme="blue" w="full" onClick={handleSubmitPasswordChange}>Change Password</Button>
        
        <Button colorScheme="red" w="full" onClick={handleDeleteAccount}>Delete Account</Button>
      </VStack>
    </Box>
  );
};

export default ProfileSettingsPage;
