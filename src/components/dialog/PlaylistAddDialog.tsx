import { Dialog, DialogContent, DialogTrigger } from "components/dialog/Dialog";
import { Button, IconTextButton } from "components/button";
import { faPlus } from "@fortawesome/pro-solid-svg-icons";
import { Column, Row } from "components/box";
import { Text } from "components/text";
import { SearchFilter } from "components/search-filter";
import { Input } from "components/form";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Listbox, ListboxOption } from "components/listbox/Listbox";
import axios from "lib/client/axios";
import styled from "styled-components";
import { LoginGate } from "components/auth/LoginGate";
import { mutate } from "swr";
import { Busy } from "components/utils/Busy";
import { isAxiosError } from "axios";

interface PlaylistAddDialogProps {
    trigger?: ReactNode;
}

export function PlaylistAddDialog({ trigger }: PlaylistAddDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <IconTextButton icon={faPlus} collapsible>New</IconTextButton>
                )}
            </DialogTrigger>
            <DialogContent title="Create a new playlist">
                {/* Only render the form when dialog is open, so it will reset after closing. */}
                {open ? (
                    <LoginGate>
                        <PlaylistAddForm
                            onSuccess={() => setOpen(false)}
                            onCancel={() => setOpen(false)}
                        />
                    </LoginGate>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

const StyledForm = styled.form`
    position: relative;
`;

interface PlaylistAddFormProps {
    onSuccess(): void;
    onCancel(): void;
}

function PlaylistAddForm({ onSuccess, onCancel }: PlaylistAddFormProps) {
    const [title, setTitle] = useState("");
    const [visibility, setVisibility] = useState("PUBLIC");

    const isValid = title !== "";

    const [isBusy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function submit(event: FormEvent) {
        event.preventDefault();

        setBusy(true);
        setError("");

        try {
            await axios.post("/api/playlist", {
                name: title,
                visibility,
            });
            await mutate((key) => [key].flat().includes("/api/me/playlist"));
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response) {
                setError(error.response.data.message ?? "An unknown error occured!");
            }

            return;
        } finally {
            setBusy(false);
        }

        onSuccess();
    }

    return (
        <StyledForm onSubmit={submit}>
            <Column style={{ "--gap": "24px" }}>
                <SearchFilter>
                    <Text>Title</Text>
                    <Input
                        value={title}
                        onChange={setTitle}
                    />
                </SearchFilter>
                <SearchFilter>
                    <Text>Visibility</Text>
                    <Listbox value={visibility} onValueChange={setVisibility}>
                        <ListboxOption value="PUBLIC">Public</ListboxOption>
                        <ListboxOption value="UNLISTED">Unlisted</ListboxOption>
                        <ListboxOption value="PRIVATE">Private</ListboxOption>
                    </Listbox>
                </SearchFilter>
                <Row $wrap style={{ "--gap": "8px", "--justify-content": "flex-end" }}>
                    <Button type="button" variant="silent" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={!isValid || isBusy}>
                        <Busy isBusy={isBusy}>Create Playlist</Busy>
                    </Button>
                </Row>
                {error ? (
                    <Text color="text-warning"><strong>The playlist could not be created: </strong>{error}</Text>
                ) : null}
            </Column>
        </StyledForm>
    );
}
