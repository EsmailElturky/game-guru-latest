from pathlib import Path

p = Path(r'd:\Game-Gure\Game-Gure\src\app\features\auth\pages\login\login.html')
c = p.read_text(encoding='utf-8')

start = c.index('@if (selectedPaymentMethod() === SubscriptionPaymentMethod.Card) {')
end = c.index('@if (selectedPaymentMethod() === SubscriptionPaymentMethod.ApplePay)')

replacement = '''<div
              class="tap-card-sdk-host w-full max-w-[450px]"
              [hidden]="selectedPaymentMethod() !== SubscriptionPaymentMethod.Card"
            >
              @if (tapCardLoading()) {
                <p class="text-center text-[#475467] font-medium py-6">
                  {{ 'subscriptionPayment.cardLoading' | translate }}
                </p>
              }
              <div [id]="cardSdkContainerId" class="tap-card-sdk w-full min-h-[220px]"></div>
            </motion.div>

            @if (selectedPaymentMethod() === SubscriptionPaymentMethod.Card) {
              <uikit-button
                [label]="'subscriptionPayment.pay' | translate"
                [icon]="language() === 'ar' ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"
                [iconPosition]="language() === 'ar' ? 'left' : 'right'"
                class="w-full"
                [style]="{ width: '100%' }"
                [disabled]="paying() || tapCardLoading() || !tapCardReady()"
                (clicked)="paySubscription()"
              ></uikit-button>
            }

            '''

replacement = replacement.replace('motion.div', 'div')

p.write_text(c[:start] + replacement + c[end:], encoding='utf-8')
print('done')
