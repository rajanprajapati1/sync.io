import { useEffect, useRef } from "react";
import { useRoom } from "./useRoom";
import { useNotification } from "@/app/components/ui/NotificationProvider";
import { getUserDisplayName } from "@/app/utils/helpers";

/**
 * Enhanced room hook that integrates with the notification system
 * Provides automatic notifications for room events and member changes
 */
export const useRoomWithNotifications = (roomId) => {
  const roomHook = useRoom(roomId);
  const { showRoomEvent } = useNotification();
  
  // Track previous members to detect joins/leaves
  const prevMembers = useRef([]);
  const prevMemberCount = useRef(0);

  // Monitor member changes
  useEffect(() => {
    if (!roomHook.members || roomHook.loading) return;

    const currentMembers = roomHook.members;
    const currentMemberCount = currentMembers.length;
    
    // Only show notifications after initial load
    if (prevMembers.current.length > 0) {
      // Check for new members (joined)
      const newMembers = currentMembers.filter(
        member => !prevMembers.current.some(prevMember => prevMember.uid === member.uid)
      );
      
      // Check for removed members (left or kicked)
      const removedMembers = prevMembers.current.filter(
        prevMember => !currentMembers.some(member => member.uid === prevMember.uid)
      );
      
      // Show notifications for new members
      newMembers.forEach(member => {
        showRoomEvent('user_joined', { 
          userName: getUserDisplayName(member) 
        });
      });
      
      // Show notifications for removed members
      removedMembers.forEach(member => {
        showRoomEvent('user_left', { 
          userName: getUserDisplayName(member) 
        });
      });
    }
    
    prevMembers.current = [...currentMembers];
    prevMemberCount.current = currentMemberCount;
  }, [roomHook.members, roomHook.loading, showRoomEvent]);

  return {
    ...roomHook,
    // Add any additional notification-specific functionality here if needed
  };
};