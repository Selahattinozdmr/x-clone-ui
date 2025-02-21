"use client";
import React, { useEffect, useState } from "react";
import Image from "./Image";
import { socket } from "@/socket";
import { set } from "zod";
import { useRouter } from "next/navigation";

type NotificationType = {
  id: string;
  senderUsername: string;
  type: "like" | "comment" | "rePost" | "follow";
  link: string;
};

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  useEffect(() => {
    socket.on("getNotification", (data: NotificationType) => {
      setNotifications((prev) => [...prev, data]);
    });
  }, []);
  const router = useRouter();
  const reset = () => {
    setNotifications([]);
    setShowNotification(false);
  };

  const handleClick = (n: NotificationType) => {
    const filteredNotifications = notifications.filter(
      (notification) => notification.id !== n.id
    );
    setNotifications(filteredNotifications);
    setShowNotification(false);
    router.push(n.link);
  };
  return (
    <div className=" relative">
      <div
        className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4 cursor-pointer"
        onClick={() => setShowNotification(!showNotification)}
      >
        <div className=" relative">

          <Image
            path={`icons/notification.svg`}
            alt={"notification"}
            w={24}
            h={24}
          />
          {notifications.length!=0 &&(<div className="absolute -top-4 -right-4 w-6 h-6 bg-iconBlue p-2 rounded-full flex items-center justify-center text-sm">
            {notifications.length}
          </div>)}
        </div>
        <span className="hidden xxl:inline">Notification</span>
      </div>
      <div
        className={` ${
          showNotification ? "visible" : "hidden"
        }  absolute -right-full p-4 rounded-lg bg-white text-black flex flex-col gap-4 w-max`}
      >
        <h1 className=" text-xl text-textGray">Notifications</h1>
        {notifications.map((notification) => (
          <div
            className="cursor-pointer"
            key={notification.id}
            onClick={() => handleClick(notification)}
          >
            <b>{notification.senderUsername}</b>{" "}
            {notification.type === "like"
              ? "liked your post"
              : notification.type === "comment"
              ? "replied your post"
              : notification.type === "rePost"
              ? "re-posted your post"
              : "followed you"}
          </div>
        ))}
        <button
          onClick={reset}
          className=" bg-black text-white p-2 text-sm rounded-lg"
        >
          Mark as read
        </button>
      </div>
    </div>
  );
};

export default Notification;
