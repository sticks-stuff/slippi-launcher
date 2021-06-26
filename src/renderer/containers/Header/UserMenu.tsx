import ButtonBase from "@material-ui/core/ButtonBase";
import DialogContentText from "@material-ui/core/DialogContentText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { slippiActivationUrl } from "common/constants";
import { shell } from "electron";
import firebase from "firebase";
import React from "react";
import { useToasts } from "react-toast-notifications";

import { ConfirmationModal } from "@/components/ConfirmationModal";
import { logout } from "@/lib/firebase";
import { useAccount } from "@/lib/hooks/useAccount";
import { changeDisplayName } from "@/lib/slippiBackend";

import { UserInfo } from "./UserInfo";

export const UserMenu: React.FC<{
  user: firebase.User;
  handleError: (error: any) => void;
}> = ({ user, handleError }) => {
  const playKey = useAccount((store) => store.playKey);
  const refreshPlayKey = useAccount((store) => store.refreshPlayKey);
  const loading = useAccount((store) => store.loading);
  const [openLogoutPrompt, setOpenLogoutPrompt] = React.useState(false);
  const [name, setName] = React.useState(user.displayName);
  const [nameChange, setNameChange] = React.useState("");
  const [openNameChangePrompt, setOpenNameChangePrompt] = React.useState(false);
  const { addToast } = useToasts();
  const onLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
      handleError(err);
    } finally {
      handleClose();
    }
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };
  const handleClose = () => {
    setOpenNameChangePrompt(false);
    setOpenLogoutPrompt(false);
  };
  const onChangeName = async () => {
    try {
      await changeDisplayName(nameChange);
      setName(nameChange);
    } catch (err) {
      console.error(err);
      handleError(err);
    } finally {
      handleClose();
    }
  };

  return (
    <div>
      <ButtonBase onClick={handleClick}>
        <UserInfo uid={user.uid} displayName={name} playKey={playKey} loading={loading} />
      </ButtonBase>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeMenu}>
        {!playKey && (
          <MenuItem
            onClick={() => {
              closeMenu();
              void shell.openExternal(slippiActivationUrl);
            }}
          >
            Activate online play
          </MenuItem>
        )}
        {!playKey && (
          <MenuItem
            onClick={() => {
              closeMenu();
              refreshPlayKey().catch((err) => addToast(err.message, { appearance: "error" }));
            }}
          >
            Refresh activation status
          </MenuItem>
        )}
        {playKey && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setOpenNameChangePrompt(true);
            }}
          >
            Edit Name
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            closeMenu();
            setOpenLogoutPrompt(true);
          }}
        >
          Logout
        </MenuItem>
      </Menu>
      <ConfirmationModal
        title="Change your Display Name"
        open={openNameChangePrompt}
        onClose={handleClose}
        onSubmit={onChangeName}
        fullWidth={false}
      >
        <Typography paragraph={true}>Enter the new name in the field below</Typography>
        <TextField
          required={true}
          id="displayName"
          variant="outlined"
          autoFocus={true}
          key={`displayName`} // Change key on new mode to force field to reset
          name="displayName"
          value={nameChange || name}
          label="Display Name"
          fullWidth={true}
          onChange={(event) => setNameChange(event.target.value)}
        />
      </ConfirmationModal>
      <ConfirmationModal
        title="Are you sure you want to log out?"
        confirmText="Log out"
        open={openLogoutPrompt}
        onClose={handleClose}
        onSubmit={onLogout}
        fullWidth={false}
        cancelColor="primary"
      >
        <DialogContentText>You will need to log in again next time you want to play.</DialogContentText>
      </ConfirmationModal>
    </div>
  );
};
