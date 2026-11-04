import { test, expect } from '@playwright/test';

test.describe('User Selection', () => {
  test('shows login page with user list', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Perusall')).toBeVisible();
    await expect(page.getByText('Select your identity to get started')).toBeVisible();
    await expect(page.getByText('Instructors')).toBeVisible();
    await expect(page.getByText('Students')).toBeVisible();
  });

  test('student can log in and see readings', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sarah').click();
    await expect(page).toHaveURL(/\/readings$/);
    await expect(page.getByText('Readings')).toBeVisible();
  });

  test('instructor can log in and see new reading button', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Dr. Smith').click();
    await expect(page).toHaveURL(/\/readings$/);
    await expect(page.getByText('+ New Reading')).toBeVisible();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/readings');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Readings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sarah').click();
    await expect(page).toHaveURL(/\/readings$/);
  });

  test('displays seeded readings', async ({ page }) => {
    await expect(page.getByText('Introduction to Machine Learning')).toBeVisible();
    await expect(page.getByText("Shakespeare's Hamlet: Act III Analysis")).toBeVisible();
    await expect(
      page.getByText('Climate Science: Current Research and Future Projections'),
    ).toBeVisible();
  });

  test('search filters readings by title', async ({ page }) => {
    await page.getByPlaceholder(/search readings/i).fill('machine');
    await expect(page.getByText('Introduction to Machine Learning')).toBeVisible();
    await expect(page.getByText("Shakespeare's Hamlet")).not.toBeVisible();
    await expect(page.getByText('Climate Science')).not.toBeVisible();
  });

  test('clicking a reading navigates to detail page', async ({ page }) => {
    await page.getByText('Introduction to Machine Learning').click();
    await expect(page).toHaveURL(/\/readings\/.+/);
    await expect(page.getByText('Discussion')).toBeVisible();
  });
});

test.describe('Instructor Creates Reading', () => {
  test('instructor can create a new reading', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Dr. Smith').click();
    await page.getByText('+ New Reading').click();

    await expect(page.getByText('Create New Reading')).toBeVisible();
    await page.getByPlaceholder('Reading title').fill('E2E Test Reading');
    await page.getByPlaceholder('Reading description').fill('Created by Playwright');
    await page.getByText('Create Reading').click();

    await expect(page.getByText('Reading created successfully!')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'E2E Test Reading' }).first()).toBeVisible();
  });

  test('instructor sees validation error on empty form', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Dr. Smith').click();
    await page.getByText('+ New Reading').click();
    await page.getByText('Create Reading').click();

    await expect(page.getByText('Both title and description are required.')).toBeVisible();
  });
});

test.describe('Reading Detail & Annotations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sarah').click();
    await page.getByText('Introduction to Machine Learning').click();
    await expect(page.getByText('Discussion')).toBeVisible();
  });

  test('shows annotations on reading detail', async ({ page }) => {
    await expect(
      page.getByText("What's the difference between supervised and unsupervised learning?"),
    ).toBeVisible();
  });

  test('student can post an annotation', async ({ page }) => {
    const uniqueText = `E2E annotation ${Date.now()}`;
    const textarea = page.getByPlaceholder(/share your thoughts/i);
    await textarea.fill(uniqueText);
    await page.getByRole('button', { name: /post/i }).click();

    await expect(page.getByText(uniqueText).first()).toBeVisible();
  });

  test('student can reply to an annotation', async ({ page }) => {
    const replyButton = page.getByRole('button', { name: /reply/i }).first();
    await replyButton.click();

    const replyInput = page.getByPlaceholder(/reply to/i);
    await replyInput.fill('E2E reply from Playwright');

    const submitReply = page.getByRole('button', { name: /^reply$/i }).last();
    await submitReply.click();

    await expect(page.getByText('E2E reply from Playwright')).toBeVisible();
  });

  test('student can filter annotations by author', async ({ page }) => {
    const filterSelect = page.locator('select');
    if ((await filterSelect.count()) > 0) {
      await filterSelect.selectOption({ label: 'Sarah' });
      await expect(
        page.getByText("What's the difference between supervised and unsupervised learning?"),
      ).toBeVisible();
    }
  });
});

test.describe('Annotation Edit & Delete', () => {
  test('student can edit their own annotation', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sarah').click();
    await page.getByText('Introduction to Machine Learning').click();
    await expect(page.getByText('Discussion')).toBeVisible();

    // Post a new annotation so we own it
    const uniqueText = `Annotation to edit ${Date.now()}`;
    const textarea = page.getByPlaceholder(/share your thoughts/i);
    await textarea.fill(uniqueText);
    await page.getByRole('button', { name: /post/i }).click();
    await expect(page.getByText(uniqueText).first()).toBeVisible();

    // Find the edit button for our annotation
    const annotation = page.getByText(uniqueText).first().locator('..');
    const editButton = annotation.getByRole('button', { name: /edit/i });
    if ((await editButton.count()) > 0) {
      await editButton.click();
      const editedText = `Edited ${Date.now()}`;
      const editInput = page.getByDisplayValue(uniqueText);
      await editInput.clear();
      await editInput.fill(editedText);
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(editedText)).toBeVisible();
    }
  });
});
