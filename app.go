package main

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	defaultRuntime "runtime"

	"github.com/go-git/go-git/v5"
	"github.com/google/go-github/github"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ArchiveCompressionOptions returns archive/compression options,
// ordered in an operating system specific way.
func (a *App) ArchiveCompressionOptions() []string {
	switch defaultRuntime.GOOS {
	case "windows":
		return []string{"tar/gzip"}
	default:
		return []string{"tar/gzip"}
	}
}

// SelectDirectory opens a directory picker dialog.
func (a *App) SelectDirectory() string {
	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil {
		log.Println(err.Error())
		return err.Error()
	}

	return dir
}

// BackupRepositories clones all repositories belonging to `username` locally,
// then compresses and archives them to `{outputPath}/{username}.tar.gz`
func (a *App) BackupRepositories(username, outputPath string) string {
	client := github.NewClient(nil)

	// Get a list of all repositories of `username`, in `repos`.
	repos, _, err := client.Repositories.List(a.ctx, username, nil)
	if err != nil {
		return err.Error()
	}

	// Make the directories for where the tarball will be.
	if err = os.MkdirAll(outputPath, 0700); err != nil {
		return err.Error()
	}

	// Create temporary directory where repositories are cloned to.
	userPath, err := os.MkdirTemp("", "gethub")
	if err != nil {
		return err.Error()
	}
	defer removeAll(userPath)

	// Create tarball file.
	file, err := os.Create(fmt.Sprintf("%s%s.tar.gz", outputPath, username))
	if err != nil {
		return err.Error()
	}
	defer file.Close()

	// Clone repositories to disk.
	err = cloneRepositories(userPath, repos)
	if err != nil {
		return err.Error()
	}

	// Change directory to `userPath` before compressing and archiving,
	// so that parent directories aren't compressed and archived.
	if err = os.Chdir(userPath); err != nil {
		return err.Error()
	}

	if err = tarGzip(".", file); err != nil {
		return err.Error()
	}

	return fmt.Sprintf("Repositories successfully backed up!")
}

// cloneRepositories clones a list of repositories to disk at `path`.
func cloneRepositories(path string, repos []*github.Repository) error {
	for _, repo := range repos {
		clonePath := filepath.Join(path, repo.GetName())

		_, err := os.Stat(clonePath)
		if err == nil {
			continue
		} else if !errors.Is(err, os.ErrNotExist) {
			return err
		}

		_, _ = git.PlainClone(clonePath, false, &git.CloneOptions{
			URL: repo.GetCloneURL(),
		})
	}

	return nil
}

// tarGzip compresses and archives a directory and its contents.
func tarGzip(path string, buffer io.Writer) error {
	gzWriter := gzip.NewWriter(buffer)
	defer gzWriter.Close()

	tarWriter := tar.NewWriter(gzWriter)
	defer tarWriter.Close()

	fileInfo, err := os.Stat(path)
	if err != nil {
		return err
	}

	mode := fileInfo.Mode()

	// If file, then gzip and tar. If dir, then walk.
	if mode.IsRegular() {
		header, err := tar.FileInfoHeader(fileInfo, path)
		if err != nil {
			return err
		}

		if err := tarWriter.WriteHeader(header); err != nil {
			return err
		}

		data, err := os.Open(path)
		if err != nil {
			return err
		}

		if _, err := io.Copy(tarWriter, data); err != nil {
			return err
		}
	} else if mode.IsDir() {
		filepath.Walk(path, func(file string, fileInfo os.FileInfo, err error) error {
			header, err := tar.FileInfoHeader(fileInfo, file)
			if err != nil {
				return err
			}

			header.Name = filepath.ToSlash(file)

			if err := tarWriter.WriteHeader(header); err != nil {
				return err
			}

			if !fileInfo.IsDir() {
				data, err := os.Open(file)
				if err != nil {
					return err
				}

				if _, err := io.Copy(tarWriter, data); err != nil {
					return err
				}
			}

			return nil
		})
	}

	return nil
}

// removeAll removes all directories and files in all paths argued.
func removeAll(paths ...string) error {
	for _, path := range paths {
		err := os.RemoveAll(path)
		if err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
	}

	return nil
}
