// Exercise secondary actions through the same disclosure a player uses.
export async function menuAction(page,selector){
 if(!await page.locator('#gameMenu').evaluate(el=>el.open))await page.locator('#menuToggle').click();
 await page.locator(selector).click();
}
