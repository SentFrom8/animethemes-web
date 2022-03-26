import Link from "next/link";
import { SongTitleWithArtists } from "components/utils";
import { Text } from "components/text";
import useImage from "hooks/useImage";
import createVideoSlug from "utils/createVideoSlug";
import { SummaryCard } from "components/card";
import { ThemeMenu } from "components/menu";
import gql from "graphql-tag";

// Specify an artist if you want to display this in an artist context (e.g. artist page)
export function ThemeSummaryCard({ theme, artist, children, ...props }) {
    const { smallCover } = useImage(theme.anime);

    if (!theme.entries.length) {
        return null;
    }

    const entry = theme.entries[0];

    if (!entry.videos.length) {
        return null;
    }

    const video = entry.videos[0];
    const videoSlug = createVideoSlug(theme, entry, video);
    const to = `/anime/${theme.anime.slug}/${videoSlug}`;

    const description = (
        <SummaryCard.Description>
            <span>Theme</span>
            <span>{theme.type}{theme.sequence || null}{theme.group && ` (${theme.group})`}</span>
            <Link href={`/anime/${theme.anime.slug}`} passHref>
                <Text as="a" link>{theme.anime.name}</Text>
            </Link>
        </SummaryCard.Description>
    );

    return (
        <SummaryCard
            title={<SongTitleWithArtists song={theme.song} songTitleLinkTo={to} artist={artist}/>}
            description={description}
            image={smallCover}
            to={to}
            {...props}
        >
            {children}
            <ThemeMenu theme={theme}/>
        </SummaryCard>
    );
}

ThemeSummaryCard.fragments = {
    theme: gql`
        ${SongTitleWithArtists.fragments.song}
        ${useImage.fragment}
        ${createVideoSlug.fragments.theme}
        ${createVideoSlug.fragments.entry}
        ${createVideoSlug.fragments.video}
        ${ThemeMenu.fragment}

        fragment ThemeSummaryCard_theme on Theme {
            ...createVideoSlug_theme
            ...ThemeMenu_theme
            slug
            type
            sequence
            group
            anime {
                ...useImage_resourceWithImages
                slug
                name
            }
            song {
                ...SongTitleWithArtists_song
            }
            entries {
                ...createVideoSlug_entry
                videos {
                    ...createVideoSlug_video
                }
            }
        }
    `,
    artist: gql`
        ${SongTitleWithArtists.fragments.artist}
        
        fragment ThemeSummaryCard_artist on Artist {
            ...SongTitleWithArtists_artist
        }
    `
};
